package pro.ach.data_architect.services.impl;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import javassist.NotFoundException;
import pro.ach.data_architect.models.Entity;
import pro.ach.data_architect.models.connection.Connection;
import pro.ach.data_architect.models.mart.EdgeMart;
import pro.ach.data_architect.models.mart.Mart;
import pro.ach.data_architect.models.mart.NodeMart;
import pro.ach.data_architect.models.mart.Relate;
import pro.ach.data_architect.models.mart.TableData;
import pro.ach.data_architect.repositories.EntityRepository;
import pro.ach.data_architect.repositories.MartRepository;
import pro.ach.data_architect.services.BeanHelper;
import pro.ach.data_architect.services.ConnectService;
import pro.ach.data_architect.services.MartService;
import pro.ach.data_architect.services.MetaDataHelper;
import pro.ach.data_architect.services.connectors.handler.DataSourceHanlerI;
import pro.ach.data_architect.services.connectors.handler.HandlerHelper;

@Component
public class MartServiceImpl implements MartService {

    private final MartRepository martRepository;
    private final ConnectService connectService;
    private final HandlerHelper handlerHelper;
    private final EntityRepository entityRepository;
    private final BeanHelper beanHelper;

    @Autowired
    public MartServiceImpl(MartRepository martRepository, ConnectService connectService, HandlerHelper handlerHelper, EntityRepository entityRepository, BeanHelper beanHelper) {
        this.martRepository = martRepository;
        this.connectService = connectService;
        this.handlerHelper = handlerHelper;
        this.entityRepository = entityRepository;
        this.beanHelper = beanHelper;
    }

    @Override
    public Page<Mart> getAll() {
        return martRepository.findAll(Pageable.ofSize(10));
    }

    @Override
    public Page<Mart> getAll(Pageable pageable) {
        return martRepository.findAll(pageable);
    }

    @Override
    public Mart findById(String id) {
        return martRepository.findById(id).orElse(null);
    }

    @Override
    public Mart save(Mart mart) throws NotFoundException {

        Connection mainConnect = connectService.getMainConnect();

        if (mart.getEntity() == null) {
            mart.setEntity(entityRepository.findById(mart.getMartInfo().getEntityId()).orElse(null));
        }

        Mart finalMart = mart;
        mart.getMartGraph()
                .getNodes()
                .forEach(nodeDto -> {
                    nodeDto.setFilters(finalMart.getFiltersForNode(nodeDto));
                    nodeDto.setRelates(new ArrayList<>());
                });

        Entity entity = mart.getEntity();
        if(mart.getMartInfo().getMartDestSchema()==null){
            mart.getMartInfo().setMartDestSchema(mainConnect.getSchema());
        }

        if (mart.getId() != null && !mart.getId().equals("")) {
            Mart martSource = martRepository.findById(mart.getId()).orElseThrow(()-> new NotFoundException("mart not found"));
            BeanUtils.copyProperties(mart, martSource, beanHelper.getNullPropertyNames(mart));
            mart = martSource;
        }
        NodeMart node = mart.getMartGraph().getNodes()
                .stream()
                .filter(n -> n.getId().equals(entity.getMetadataId()))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Node not found"));

        node.setRelates(getRelatesForNode(node, mart.getMartGraph().getNodes(), mart.getMartGraph().getEdges()));
        mart.setNode(node);
        return martRepository.save(mart);
    }

    @Override
    public void delete(Mart mart) throws SQLException {
        Connection connection = connectService
                .getMainConnect();

        if (connection != null) {
            DataSourceHanlerI handler = handlerHelper.getHandler(connection);
            handler.setConnection(connection);
            handler.deleteTable(MetaDataHelper.getTableName(mart.getMartInfo().getMartDestSchema(),mart.getMartInfo().getMartDestTable()));
        }


        martRepository.delete(mart);
    }

    @Override
    public void createTable(Mart mart) throws NotFoundException {
        Connection connection = connectService
                .getMainConnect();

        if (connection == null) {
            throw new NotFoundException("mart connection isn't configured");
        }

        DataSourceHanlerI handler = handlerHelper.getHandler(connection);
        handler.setConnection(connection);
        handler.save(mart);
        try {
            List<TableData> dataByTable = handler.getDataByTable(mart);
            mart.getMartInfo().setMartRowsCount(dataByTable.size());
        } catch (SQLException e) {
            mart.getMartInfo().setMartRowsCount(0);
            e.printStackTrace();
        }
        martRepository.save(mart);

    }

    @Override
    public List<TableData> getDataByMartTable(Mart mart) throws SQLException, NotFoundException {
        Connection connection = connectService
                .getMainConnect();
        if (connection == null) {
            throw new NotFoundException("mart connection isn't configured");
        }
        DataSourceHanlerI handler = handlerHelper.getHandler(connection);
        handler.setConnection(connection);
        return handler.getDataByTable(mart);

    }

    @Override
    public void deleteOldMarts() {
        List<Mart> martsByDueDateBefore = martRepository.getMartsByMartInfoMartDueDateBefore(new Date());
        martsByDueDateBefore.forEach(mart -> {
            try {
                delete(mart);
            } catch (SQLException e) {
                e.printStackTrace();
            }
        });
    }

    private List<Relate> getRelatesForNode(NodeMart node, Set<NodeMart> nodes, Set<EdgeMart> edges) {
        Set<EdgeMart> copyEdges = new HashSet<>(edges);
        List<Relate> relates = new ArrayList<>();
        List<EdgeMart> edgesForNode = copyEdges
                .stream()
                .filter(edge ->
                        edge.getTargetData().getMetadataId().equals(node.getId()) ||
                                edge.getSourceData().getMetadataId().equals(node.getId())
                )
                .collect(Collectors.toList());

        edgesForNode.forEach(copyEdges::remove);
        edgesForNode.forEach(edge -> {
            String id = edge.getSourceData().getMetadataId().equals(node.getId()) ? edge.getTargetData().getMetadataId() : edge.getSourceData().getMetadataId();
            NodeMart relateNode = nodes.stream().filter(n -> n.getId().equals(id)).findFirst().orElse(null);
            if (relateNode != null && relateNode.getSelected()) {
                Relate relate = new Relate();
                relate.setEdge(edge);
                relate.setNode(relateNode);
                relateNode.setRelates(getRelatesForNode(relateNode, nodes, copyEdges));
                relates.add(relate);
            }
        });
        return relates;
    }


}
