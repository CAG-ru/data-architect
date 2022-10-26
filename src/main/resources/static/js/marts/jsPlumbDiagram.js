// ------------------------------------------
// Работа с диаграммой
function jsPlumbReady(json_data) {
  console.info('---- jsPlumbReady ---');

  if (json_data.length == 0) {
    console.warn('Данные для диаграммы пустые');
    return;
  }

  jsPlumbToolkit.ready(function () {
    console.info('---- jsPlumbToolkit ready ---');

    jsPlumb.reset();

    // ------------------------ toolkit setup ------------------------------------
    // $(".relations-editor-spinner").html(getSpinner());

    // This function is what the toolkit will use to get an ID from a node.
    let idFunction = function (n) {
      return n.id;
    };

    // This function is what the toolkit will use to get the associated type from a node.
    let typeFunction = function (n) {
      return n.type;
    };

    // get the various dom elements
    let mainElement = document.querySelector("#jtk-demo-dbase");
    if (mainElement == null) {
      console.warn('Нет элемента на странице для отображения');
      return;
    }
    let canvasElementObject = $("div[id^=jtk-canvas]");
    let canvasElement_new_id = 'jtk-canvas-' + new Date().getTime();
    canvasElementObject.attr('id', canvasElement_new_id);
    let canvasElement = mainElement.querySelector("div[id^=jtk-canvas]");
    // Очистим область
    $("#"+canvasElement_new_id).empty();

    let miniviewElement = mainElement.querySelector(".miniview");
    let nodePalette = mainElement.querySelector(".node-palette");
    let controls = mainElement.querySelector(".controls");

    // Declare an instance of the Toolkit, and supply the functions we will use to get ids and types from nodes.
    let toolkit = jsPlumbToolkit.newInstance({
      idFunction: idFunction,
      typeFunction: typeFunction,
      groupFactory: function (type, data, callback) {
        data.title = "Group " + (toolkit.getGroupCount() + 1);
        callback(data);
      },
      nodeFactory: function (type, data, callback) {
        data.columns = [];
        jsPlumbToolkit.Dialogs.show({
          id: "dlgName",
          title: "Enter " + type + " name:",
          onOK: function (d) {
            data.name = d.name;
            // if the user entered a name...
            if (data.name) {
              if (data.name.length >= 2) {
                // generate an id: replace spaces with underscores, and make lower case
                data.id = data.name.replace(" ", "_").toLowerCase();
                callback(data);
              } else
                alert(type + " names must be at least 2 characters!");
            }
            // else...do not proceed.
          }
        });
      },
      edgeFactory: function (params, data, callback) {
        // you must hit the callback if you provide the edgeFactory.
        callback(data);
        // unless you want to return false, to abandon the edge
        //return false;
      },
      // the name of the property in each node's data that is the key for the data for the ports for that node.
      // we used to use portExtractor and portUpdater in this demo, prior to the existence of portDataProperty.
      // for more complex setups, those functions may still be needed.
      portDataProperty: "columns",
      //
      // Prevent connections from a column to itself or to another column on the same table.
      //
      beforeConnect: function (source, target) {
        return source !== target && source.getNode() !== target.getNode();
      }
    });

    // ------------------------ / toolkit setup ------------------------------------

    // ------------------------- dialogs -------------------------------------

    jsPlumbToolkit.Dialogs.initialize({
      selector: ".dlg"
    });

    // ------------------------- / dialogs ----------------------------------

    jsPlumb.on(controls, "tap", "[undo]", function () {
      //undoredo.undo();
    });

    jsPlumb.on(controls, "tap", "[redo]", function () {
      //undoredo.redo();
    });


    // ------------------------ rendering ------------------------------------

    // Instruct the toolkit to render to the 'canvas' element. We pass in a model of nodes, edges and ports, which
    // together define the look and feel and behaviour of this renderer.  Note that we can have 0 - N renderers
    // assigned to one instance of the Toolkit..
    let surface = window.renderer = toolkit.render({
      container: canvasElement,
      view: {
        groups: {
          "default": {
            template: "tmplGroup",
            endpoint: "Blank",
            anchor: "Continuous",
            revert: false,
            orphan: true,
            constrain: false,
            layout: {
              type: "Spring"
            }
          },
          constrained: {
            parent: "default",
            constrain: true
          }
        },
        // Two node types - 'table' and 'view'
        nodes: {
          "table": {
            template: "tmplTable"
          },
          "view": {
            template: "tmplView"
          }
        },
        // Three edge types  - '1:1', '1:N' and 'N:M',
        // sharing  a common parent, in which the connector type, anchors
        // and appearance is defined.
        edges: {
          "common": {
            detachable: false,
            endpoints: ["Blank", "Blank"],
            connector: "Bezier", //  StateMachine connector type
            // cssClass: "common-edge",
            events: {},
            overlays: [
              ["Arrow", {
                fill: "#89bcde",
                width: 10,
                length: 10,
                location: 1,
                direction: -1
              }]
            ],
          },
          "bidirectional": {
            parent: "common",
            overlays: [
              ["Arrow", {
                fill: "#89bcde",
                width: 10,
                length: 10,
                location: 0,
                direction: -1
              }]
            ]
          },
          "blank": {
            detachable: false,
            endpoints: ["Blank", "Blank"],
            connector: "Bezier", //  StateMachine connector type
            // cssClass: "blank-edge",
            events: {},
            overlays: [],
          }, // each edge type has its own overlays.
          "1:1": {
            parent: "common",
            overlays: [
              ["Label", {
                label: "1",
                location: 0.1
              }],
              ["Label", {
                label: "1",
                location: 0.9
              }]
            ]
          },
          "1:N": {
            parent: "common",
            overlays: [
              ["Label", {
                label: "1",
                location: 0.1
              }],
              ["Label", {
                label: "N",
                location: 0.9
              }]
            ]
          },
          "N:M": {
            parent: "common",
            overlays: [
              ["Label", {
                label: "N",
                location: 0.1
              }],
              ["Label", {
                label: "M",
                location: 0.9
              }]
            ]
          },
          "Fkey": {
            parent: "common",
            cssClass: "common-edge-fkey",
            overlays: [
              ["Label", {
                label: "Foreign key",
                location: 0.1
              }],
              ["Label", {
                label: "Foreign key",
                location: 0.9
              }]
            ]
          },
          "Manual": {
            parent: "common",
            cssClass: "common-edge-manual",
            events: {
              "dbltap": function (params) {
                _editEdge(params.edge);
              }
            },
            overlays: [
              ["Label", {
                label: "Ручная связь",
                location: 0.1
              }],
              ["Label", {
                label: "Ручная связь",
                location: 0.9
              }],
              ["Label", {
                cssClass: "delete-relationship",
                label: "<i class='fa fa-times'></i>",
                events: {
                  "tap": function (params) {
                    toolkit.removeEdge(params.edge);
                  }
                }
              }]
            ]
          },
          "Auto": {
            parent: "common",
            cssClass: "common-edge-auto",
            events: {
              "dbltap": function (params) {
                _editEdge(params.edge);
              }
            },
            overlays: [
              ["Label", {
                label: "Авто-связь",
                location: 0.1
              }],
              ["Label", {
                label: "Авто-связь",
                location: 0.9
              }],
              ["Label", {
                cssClass: "delete-relationship",
                label: "<i class='fa fa-times'></i>",
                events: {
                  "tap": function (params) {
                    toolkit.removeEdge(params.edge);
                  }
                }
              }]
            ]
          }
        },
        // There is only one type of Port - a column - so we use the key 'default' for the port type
        // Here we define the appearance of this port,
        // and we instruct the Toolkit what sort of Edge to create when the user drags a new connection
        // from an instance of this port. Note that we here we tell the Toolkit to create an Edge of type
        // 'common' because we don't know the cardinality of a relationship when the user is dragging. Once
        // a new relationship has been established we can ask the user for the cardinality and update the
        // model accordingly.
        ports: {
          "default": {
            template: "tmplColumn",
            anchor: ["Left", "Right"],
            paintStyle: {
              fill: "#f76258"
            }, // the endpoint's appearance
            hoverPaintStyle: {
              fill: "#434343"
            }, // appearance when mouse hovering on endpoint or connection
            edgeType: "blank", // the type of edge for connections from this port type
            maxConnections: 0, // no limit on connections
            // "id": {
            isSource: true,
            isTarget: true,
            isEndpoint: true,
            // },
            connectorStyle: {
              strokeWidth: 4,
              stroke: "darkgray",
            },
            dropOptions: { //drop options for the port. here we attach a css class.
              hoverClass: "drop-hover"
            },
            events: {}
          }
        }
      },
      // Layout the nodes using a 'Spring' (force directed) layout. This is the best layout in the jsPlumbToolkit
      // for an application such as this.
      layout: {
        type: "Hierarchical",
        parameters: {
          padding: [20, 20],
          "orientation": "horizontal",
          "align": "start",
          "spacing": "compress",
        },
        magnetize: true,
      },
      miniview: {
        container: miniviewElement
      },
      // Register for certain events from the renderer. Here we have subscribed to the 'nodeRendered' event,
      // which is fired each time a new node is rendered.  We attach listeners to the 'new column' button
      // in each table node.  'data' has 'node' and 'el' as properties: node is the underlying node data,
      // and el is the DOM element. We also attach listeners to all of the columns.
      // At this point we can use our underlying library to attach event listeners etc.
      events: {
        edgeAdded: function (params) {
          // Check here that the edge was not added programmatically, ie. on load.
          if (params.addedByMouse) {
            _editEdge(params.edge, true);
          }
        },
        canvasClick: function (e) {
          toolkit.clearSelection();
        }
      },
      dragOptions: {
        filter: "i, .view .buttons, .table .buttons, .table-column *, .view-edit, .edit-name, .delete, .add, .btn-close-table-data-content, .table-filter-info, .table-data-info .table_select .column_select"
        // filter: ""
      },
      zoomToFit: true,
      jsPlumb: {
        directed: false,
        Anchor: "Continuous",
        Connector: ["Straight", {
          cssClass: "connectorClass",
          hoverClass: "connectorHoverClass"
        }],
      },
    });

    // ------------------------ loading  ------------------------------------


    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Load the data.
    console.info('---- Load the data ---');
    toolkit.clear();
    toolkit.load({
      type: 'json',
      data: json_data,
      onload: function () {
        $(".relations-editor-spinner").remove();
        setHeightForJTKCanvas();
        surface.zoomToFit(doNotAnimate = false);
      }
    });

    // listener for mode change on renderer.
    surface.bind("modeChanged", function (mode) {
      jsPlumb.removeClass(controls.querySelectorAll("[mode]"), "selected-mode");
      jsPlumb.addClass(controls.querySelectorAll("[mode='" + mode + "']"), "selected-mode");
    });
    /*
            var undoredo = window.undoredo = new jsPlumbToolkitUndoRedo({
                surface:surface,
                onChange:function(undo, undoSize, redoSize) {
                    controls.setAttribute("can-undo", undoSize > 0);
                    controls.setAttribute("can-redo", redoSize > 0);
                },
                compound:true
            });
    */

    // ------------------------------------------
    function setNodeToggleSelected(node) {
      console.info('---- setNodeToggleSelected ---');

      let nodeData = node.data;
      nodeData.selected = !nodeData.selected;

      for (let i = 0; i < nodeData.columns.length; i++) {
        col = nodeData.columns[i];
        col.selected = nodeData.selected;
      }

      toolkit.updateNode(node, nodeData);
    }

    // ------------------------------------------
    function setNodeSelected(node, selected, mark_relations_columns_only = false) {
      let nodeData = node.data;
      nodeData.selected = selected;

      for (let k = 0; k < nodeData.columns.length; k++) {
        column = nodeData.columns[k];
        // Отмечать только столбцы со связями
        if (mark_relations_columns_only) {
          // Проверка, что столбец имеет связь
          if (isColumnHasRelation(column)) {
            column.selected = selected;
          }
        } else {
          column.selected = selected;
        }
      }

      toolkit.updateNode(node, nodeData);
    }

    // ------------------------------------------
    // Проверка, что столбец имеет связь
    function isColumnHasRelation(column) {
      let node_id = column.id.split('_')[0];
      let arAllEdges = toolkit.getNode(node_id).getAllEdges();
      let result = false;
      $.each(arAllEdges, function (index, value) {
        if ((value.source.id == column.id) || (value.target.id == column.id)) {
          result = true;
          return true;
        }
      });
      return result;
    }

    // ------------------------------------------
    function isNodeSelected(node) {
      return node.data.selected;
    }

    // ------------------------------------------
    function setPortToggleSelected(port) {
      console.info('---- setPortToggleSelected ---');

      let portData = port.data;
      let node = port.getNode();

      // Укажем, что данная колонка помечена
      portData.selected = !portData.selected;
      let needSelected = portData.selected;

      // Проверяем есть ли еще помеченные колонки в узле
      let columns = node.data.columns;
      for (let i = 0; i < columns.length; i++) {
        needSelected = !needSelected && columns[i].selected ? true : needSelected;
      }

      // Изменяем пометку у узла
      nodeData = node.data;
      if (nodeData.selected != needSelected) {
        nodeData.selected = needSelected;
      }
      console.log('--- setPortToggleSelected node: ---');
      console.log(node);
      console.log('--- setPortToggleSelected nodeData: ---');
      console.log(nodeData);
      toolkit.updateNode(node, nodeData);
    }

    // ------------------------------------------
    function setPathNodesSelected(node, mark_current_node = true, mark_relations_columns_only = false, port = false) {
      nodes = toolkit.getNodes();
      node0 = nodes[0];

      // Если узел (таблица) не помечен, то остальные узлы от начала и до этого узла обрабатывать не надо
      if (!isNodeSelected(node)) {
        return;
      }
      // TODO: Если узел (таблица) не помечен, надо снимать пометку со всех узлов ПОСЛЕ этого узла. 
      // ? Пока не поняно как их искать ? 

      // TODO: Сейчас помечается полностью узел со всеми колонками. Наверное правильно помечать не полностью узел, а только колонки, через которые осуществляется связь? 


      edges = toolkit.getAllEdges();
      startEdge = undefined;
      for (let i = 0; i < edges.length; i++) {
        edge = edges[i];
        edgeNode = edge.source.getNode();
        if (edgeNode == node0) {
          startEdge = edge;
          break;
        }
      }
      // Помечаем все узлы по пути от начального узла до текущего
      // path = toolkit.getPath({
      //   source: node,
      //   target: node0,
      //   strict: false,
      //   nodeFilter: function (n) {
      //     return false;
      //   },
      //   edgeFilter: function (e) {
      //     return false;
      //   }
      // });
      // console.log(path);
      // console.log(path.getNodes());
      // console.log('--- getGraph().findPath ---');
      // path = toolkit.getGraph().findPath(
      //   node0.id,
      //   node.id,
      // );
      // console.log('--- path ---');
      // console.log(path);

      // console.log('--- node0.id ---');
      // console.log(node0.id);
      // console.log('--- node.id ---');
      // console.log(node.id);
      path = toolkit.getPath({
        source: node0.id,
        target: node.id,
        strict: false,
        nodeFilter: function (n) {
          return true;
        },
        edgeFilter: function (e) {
          return true;
        }
      });
      // console.log('--- path ---');
      // console.log(path.path);
      // console.log('--- path.getNodes() ---');
      // console.log(path.getNodes());

      if (path.isEmpty()) {
        path = toolkit.getPath({
          source: node.id,
          target: node0.id,
          strict: false,
          nodeFilter: function (n) {
            return true;
          },
          edgeFilter: function (e) {
            return true;
          }
        });
        // console.log('--- path reverse ---');
        // console.log(path.path);
        // console.log('--- path.getNodes() reverse ---');
        // console.log(path.getNodes());
      }

      edges = path.path.edges;
      console.log('--- edges ---');
      console.log(edges);
      prev = path.path.previous;
      // // pathPorts = path.ge
      pathNodes = path.getNodes();
      //console.log('--- pathNodes ---');
      //console.log(pathNodes);
      for (let i = 0; i < pathNodes.length; i++) {
        if (pathNodes[i].id == node.id) {
          if (mark_current_node) {
            setNodeSelected(pathNodes[i], true, mark_relations_columns_only);
          }
        } else {
          setNodeSelected(pathNodes[i], true, mark_relations_columns_only);
        }
      }

      for (let i = 0; i < edges.length; i++) {
        console.log(edges[i]);
        edges[i].setAttribute('stroke', 'blue');
      }

    }

    // ------------------------- behaviour ----------------------------------
    // ------------------------------------------
    // Enable toolkit for dinamical objects
    jsPlumb.on(canvasElement, "mouseover", function (e) {
      console.info('---- table_select -> mouseover ---');
      jsPlumbUtil.consume(e);
      var info = renderer.getObjectInfo(this);
      $(this).tooltip();
    });

    // ------------------------------------------
    jsPlumb.on(canvasElement, "tap", ".table_select", function (e) {
      console.info('---- table_select -> tap ---');

      jsPlumbUtil.consume(e);
      var info = renderer.getObjectInfo(this);
      node = info.obj;
      // var nodeData = info.obj.data;
      // console.dir(nodeData);
      setNodeToggleSelected(node);

      setPathNodesSelected(node, true, true);

      //surface.setZoom(0.8);
      //surface.centerOn(node);

    });


    // ------------------------------------------
    jsPlumb.on(canvasElement, "tap", ".table-column-select, .table-column-select i", function (e) {
      console.info('---- table-column-select -> tap ---');

      jsPlumbUtil.consume(e);
      // Позиционируем на узле
      let info = renderer.getObjectInfo(this);
      let port = info.obj;
      setPortToggleSelected(port);

      let node = port.getNode();
      setPathNodesSelected(node, true, true, port);

      //surface.setZoom(0.8);
      //surface.centerOn(node);
    });

    var _metadata_filter = [];

    // ------------------------------------------
    // Отрисовка окна для вывода фильтра (данных) таблицы
    jsPlumb.on(canvasElement, "tap", ".table-filter-info", function (e) {
      console.info('---- table-filter-info -> tap ---');
      let metadata_filter = [];
      let metadata_info_object = $(this).parent().parent();

      console.log("metadata_info_object",metadata_info_object);
      _metadata_filter.connect_id = metadata_filter.connect_id = metadata_info_object.children('input[name=connect_id]').val();
      _metadata_filter.schema = metadata_filter.schema = metadata_info_object.children('input[name=schema]').val();
      _metadata_filter.metadata_name = metadata_filter.metadata_name = metadata_info_object.children('input[name=metadata_name]').val();
      _metadata_filter.metadata_id = metadata_filter.metadata_id = metadata_info_object.children('input[name=metadata_id]').val();

      if (isMartMetadataFiltersExists(metadata_filter)) {
        $('#add_MetadataColumnFilter').show();
        makeModalListMartMetadataFilters(metadata_filter);
      } else {
        makeModalEditMartMetadataFilter(metadata_filter);
      }
    });

    // ------------------------------------------
    //
    function isMartMetadataFiltersExists(metadata_filter) {
      let result = false;
      if (typeof (_mart_filters) != 'undefined') {
        for (let i = 0; i < _mart_filters.length; i++) {
          if (_mart_filters[i].connect_id == metadata_filter.connect_id) {
            if (_mart_filters[i].schema == metadata_filter.schema) {
              if (_mart_filters[i].metadata_name == metadata_filter.metadata_name) {
                result = true;
                break;
              }
            }
          }
        }
      }
      return result;
    }

    // ------------------------------------------
    //
    function makeModalListMartMetadataFilters(metadata_filter) {
      let html_listMartMetadataFilters = '';

      for (let i = 0; i < _mart_filters.length; i++) {
        if ((_mart_filters[i].connect_id == metadata_filter.connect_id) || (typeof (metadata_filter.connect_id) == 'undefined')) {
          if ((_mart_filters[i].schema == metadata_filter.schema) || (typeof (metadata_filter.schema) == 'undefined')) {
            if ((_mart_filters[i].metadata_name == metadata_filter.metadata_name) || (typeof (metadata_filter.metadata_name) == 'undefined')) {

              html_listMartMetadataFilters += '<tr><td>';
              html_listMartMetadataFilters += _mart_filters[i].schema + ':';
              html_listMartMetadataFilters += _mart_filters[i].metadata_name;
              html_listMartMetadataFilters += '.' + _mart_filters[i].column_name;
              html_listMartMetadataFilters += ' ' + _mart_filters[i].condition_type;
              html_listMartMetadataFilters += ' ' + _mart_filters[i].condition_values;
              html_listMartMetadataFilters += '</td>';
              html_listMartMetadataFilters += '<td class="text-right">';
              html_listMartMetadataFilters += '<input type="hidden" name="list_metadata_filter_column_name" value="' + _mart_filters[i].column_name + '">';
              if (typeof (metadata_filter.metadata_name) != 'undefined') {
                html_listMartMetadataFilters += '<button class="btn btn-outline-primary btn-sm" name="btn_EditMetadataColumnFilter">Редактировать</button>';
              }
              html_listMartMetadataFilters += '</td></tr>';
            }
          }
        }
      }

      if (html_listMartMetadataFilters != "") {
        let html_listMartMetadataParams = '';
        html_listMartMetadataParams += '<div id="list_metadata_filter_params">';
        html_listMartMetadataParams += '<input type="hidden" name="metadata_filter_params_connect_id" value="' + metadata_filter.connect_id + '" >';
        html_listMartMetadataParams += '<input type="hidden" name="metadata_filter_params_schema" value="' + metadata_filter.schema + '" >';
        html_listMartMetadataParams += '<input type="hidden" name="metadata_filter_params_metadata_name" value="' + metadata_filter.metadata_name + '" >';
        html_listMartMetadataParams += '<input type="hidden" name="metadata_filter_params_metadata_id" value="' + metadata_filter.metadata_id + '" >';
        html_listMartMetadataParams += '</div>';

        html_listMartMetadataFilters = '<table class="table"><tbody>' + html_listMartMetadataFilters + '</tbody></table>';
        html_listMartMetadataFilters += html_listMartMetadataParams;
      }

      $('#listMartMetadataFilters').html(html_listMartMetadataFilters);
      bindBtnEditMetadataColumnFilter();

      // Модификация заголовка модального окна для выбранного метаданного
      if (typeof (metadata_filter.metadata_name) != 'undefined' && metadata_filter.metadata_name != '') {
        $('#modal_title_listMartFilters').html('Список фильтров для метаданного <b>' + metadata_filter.metadata_name + '</b>');
      }

      // Покажем диалоговое окно      
      $('#modal_listMartFilters').modal();
    }

    // ------------------------------------------
    //
    function bindBtnEditMetadataColumnFilter() {
      $('button[name=btn_EditMetadataColumnFilter]').on('click', function () {
        let metadata_filter = [];

        let metadata_info_object = $('#list_metadata_filter_params');
        _metadata_filter.connect_id = metadata_filter.connect_id = metadata_info_object.children('input[name=metadata_filter_params_connect_id]').val();
        _metadata_filter.schema = metadata_filter.schema = metadata_info_object.children('input[name=metadata_filter_params_schema]').val();
        _metadata_filter.metadata_name = metadata_filter.metadata_name = metadata_info_object.children('input[name=metadata_filter_params_metadata_name]').val();
        _metadata_filter.metadata_id = metadata_filter.metadata_id = metadata_info_object.children('input[name=metadata_filter_params_metadata_id]').val();
        // Узнаем значение столбца
        let column_name = $(this).parent().children('input[name=list_metadata_filter_column_name]').val();
        console.log('--- column_name ---');
        console.log(column_name);
        metadata_filter.column_name = column_name;
        // Скроем окно списка фильтров
        $("#modal_listMartFilters").modal('hide');
        // Покажем окно редактирования фильтра
        makeModalEditMartMetadataFilter(metadata_filter);
      });
    }

    // ------------------------------------------
    $('button#add_MetadataColumnFilter').on('click', function () {
      $("#modal_listMartFilters").modal('hide');
      let metadata_filter = [];
      let metadata_info_object = $('#list_metadata_filter_params');
      _metadata_filter.connect_id = metadata_filter.connect_id = metadata_info_object.children('input[name=metadata_filter_params_connect_id]').val();
      _metadata_filter.schema = metadata_filter.schema = metadata_info_object.children('input[name=metadata_filter_params_schema]').val();
      _metadata_filter.metadata_name = metadata_filter.metadata_name = metadata_info_object.children('input[name=metadata_filter_params_metadata_name]').val();
      _metadata_filter.metadata_id = metadata_filter.metadata_id = metadata_info_object.children('input[name=metadata_filter_params_metadata_id]').val();
      makeModalEditMartMetadataFilter(metadata_filter);
    });

    // ------------------------------------------
    //
    function makeModalEditMartMetadataFilter(metadata_filter) {
      console.info('---- makeModalEditMartMetadataFilter start... ---');

      //$('#modal_editMartFilter #edit_metadata_filter_connect_id_name').text(metadata_filter.connect_id);
      $('#modal_editMartFilter #edit_metadata_filter_connect_id').val(metadata_filter.connect_id);
      var connect_id = metadata_filter.connect_id;
      // $.ajax({
      //   url: '/marts/manage-mart/',
      //   method: "POST",
      //   dataType: "json",
      //   data: {
      //     "action": "get_source_connections_name",
      //     "ar_connect_ids": [connect_id],
      //   },
      //   complete: function () {},
      //   success: function (data) {
      //     var ar_connects = data.connects;
      //     console.log(`ajax action 'get_source_connections_name' SUCCESS.`);
      //     for (let i = 0; i < ar_connects.length; i++) {
      //       if (ar_connects[i].connect_id == connect_id) {
      //         $('#modal_editMartFilter #edit_metadata_filter_connect_id_name').val(ar_connects[i].name);
      //         break;
      //       }
      //     }
      //   },
      //   error: function () {
      //     console.error(`ajax action 'get_source_connections_name' ERROR.`);
      //   }
      // });

      $('#modal_editMartFilter #edit_metadata_filter_schema').val(metadata_filter.schema);
      $('#modal_editMartFilter #edit_metadata_filter_id').val(metadata_filter.metadata_id);
      //$('#modal_editMartFilter #edit_metadata_filter_schema_text').text(metadata_filter.schema);

      $('#modal_editMartFilter #edit_metadata_filter_metadata_name').val(metadata_filter.metadata_name);
      $('#modal_editMartFilter #edit_metadata_filter_metadata_id').val(metadata_filter.metadata_id);
      $('#modal_editMartFilter #edit_metadata_filter_metadata_name_text').text(metadata_filter.metadata_name);

      // Получим из графа список столбцов метаданного
      var metadata_columns = getNodeObjectByMetadataParams(metadata_filter);
      // Промежуточный массив для хранения списка имен столбцов метаданного
      var metadata_filter_columns = [];
      console.log("columns",metadata_columns);
      for (let c = 0; c < metadata_columns.length; c++) {
        metadata_filter_columns[c] = [];
        metadata_filter_columns[c].name = metadata_columns[c].data.name;
        metadata_filter_columns[c].comment = metadata_columns[c].data.comment;
      }
      // Сортировка столбцов по имени
      metadata_filter_columns = metadata_filter_columns.sort(filter_name_compare);
      // Добавим столбцы в select#metadata_filter_columns
      var select_columns_object = document.getElementById('edit_metadata_filter_column_name');
      // Предварительно очистим все option внутри select
      select_columns_object.innerHTML = '';
      for (let c = 0; c < metadata_filter_columns.length; c++) {
        var option = document.createElement('option');
        option.value = metadata_filter_columns[c].name;
        option.innerHTML = metadata_filter_columns[c].name + " (" + metadata_filter_columns[c].comment + ")";
        select_columns_object.appendChild(option);
      }
      $('#modal_editMartFilter #edit_metadata_filter_column_name').val(metadata_filter.column_name);

      // Очистим поля формы
      $('#modal_editMartFilter #edit_metadata_filter_condition_type').val('');
      $('#modal_editMartFilter input[name="edit_metadata_filter_condition_values[]"]').val('');
      $('#modal_editMartFilter #edit_metadata_filter_condition_min').val('');
      $('#modal_editMartFilter #edit_metadata_filter_condition_max').val('');


      var mart_filter_index = getMartFilterIndex(metadata_filter);
      if (mart_filter_index >= 0) {
        // Заполним поля формы
        $('#modal_editMartFilter #edit_metadata_filter_condition_type').val(_mart_filters[mart_filter_index].condition_type);
        $('#modal_editMartFilter input[name="edit_metadata_filter_condition_values[]"]').val(_mart_filters[mart_filter_index].condition_values);
        $('#modal_editMartFilter #edit_metadata_filter_condition_min').val(_mart_filters[mart_filter_index].condition_min);
        $('#modal_editMartFilter #edit_metadata_filter_condition_max').val(_mart_filters[mart_filter_index].condition_max);
      }
      get_column_data(true);

      var condition_type_value = $('#edit_metadata_filter_condition_type').val();
      changeMinMaxValuesBlockVisible(condition_type_value);
      // Покажем диалоговое окно      
      $('#modal_editMartFilter').modal();
    }

    var column_data_filtered = [];

    // ------------------------------------------
    //
    $('#edit_metadata_filter_column_name').on('change', function () {
      console.log('--- edit_metadata_filter_column_name on change  ---');
      get_column_data(true);
    });

    // ------------------------------------------
    //
    $('input[name="edit_metadata_filter_condition_values[]"]').on('focus', function () {
      console.log('--- input[name="edit_metadata_filter_condition_values[]"] on focus  ---');
      get_column_data(true);
    });

    // ------------------------------------------
    //
    $('input[name="edit_metadata_filter_condition_values[]"]').on('change', function () {
      console.log('--- input[name="edit_metadata_filter_condition_values[]"] on focus  ---');
      get_column_data(false);
    });

    // ------------------------------------------
    //
    function get_column_data(column_changed) {
      console.log('--- get_column_data  ---');
      console.log('--- column_changed = ', column_changed);

      $('input[name="edit_metadata_filter_condition_values[]"]').autocomplete({
        source: function (request, response) {
          var connect_id = $('#modal_editMartFilter #edit_metadata_filter_connect_id').val();
          var schema = $('#modal_editMartFilter #edit_metadata_filter_schema').val();
          var metadata_name = $('#modal_editMartFilter #edit_metadata_filter_metadata_name').val();
          var metadata_id = $('#modal_editMartFilter #edit_metadata_filter_metadata_id').val();
          var column_name = $('#modal_editMartFilter #edit_metadata_filter_column_name').val();
          var column_data_prefix = $('input[name="edit_metadata_filter_condition_values[]"]').val();
          if ((connect_id != "") || (schema != "") || (metadata_name != "") || (column_name != "")) {} else {
            return [];
          }

          if (column_changed) {
            $.ajax({
              url: '/marts/manage-mart/',
              method: "POST",
              dataType: "json",
              data: {
                "action": "get_column_data",
                "connect_id": connect_id,
                "schema": schema,
                "metadata_name": metadata_name,
                "metadata_id": metadata_id,
                "column_name": column_name,
                "column_data_prefix": column_data_prefix,
              },
              complete: function () {},
              success: function (data) {
                console.log(`ajax action 'get_source_connections_name' SUCCESS.`);
                column_data_filtered = [];
                $.each(data.column_data, function (k, v) {
                  if ((column_data_prefix == "") ||
                    ((column_data_prefix != "") && (v.value.toLowerCase().indexOf(column_data_prefix.toLowerCase()) != -1))) {
                    column_data_filtered.push({
                      label: v.label,
                      value: v.value,
                    });
                  }
                });
                response(column_data_filtered);
              },
              error: function () {
                console.error(`ajax action 'get_source_connections_name' ERROR.`);
              }
            });
          } else {
            response(column_data_filtered);
          }
          console.log('--- column_data_filtered ---');
          console.log(column_data_filtered);
        }
      });
    }

    // ------------------------------------------
    //
    function getNodeObjectByMetadataParams(metadata_params) {
      console.log("metadata_params",metadata_params);
      var metadata_columns = false;
      var nodes = renderer.getNodes();
      console.log("nodes",nodes);

      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].data.connect_id == metadata_params['connect_id']) {
          // if (nodes[i].data.schema == metadata_params['schema']) {
            if (nodes[i].data.metadata_name == metadata_params['metadata_name']) {
              var node = nodes[i];
              metadata_columns = node.getPorts();
              break;
            }
          // }
        }
      }
      return metadata_columns;
    }

    // ------------------------------------------
    //
    function filter_name_compare(a, b) {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      // a должно быть равным b
      return 0;
    }

    // ------------------------------------------
    //
    $('#edit_metadata_filter_condition_type').on('change', function () {
      var condition_type_value = $(this).val();
      changeMinMaxValuesBlockVisible(condition_type_value);
    });

    // ------------------------------------------
    //
    function changeMinMaxValuesBlockVisible(condition_type_value = false) {
      if (!condition_type_value) {
        condition_type_value = $('#edit_metadata_filter_condition_type').val();
      }
      console.log('--- condition_type_value ---');
      console.log(condition_type_value);
      var condition1 = ['==', '!=', '>', '>=', '<', '<='];
      var condition2 = ['><', '=><='];
      if (condition1.includes(condition_type_value)) {
        console.log("--- condition_type_value in '==','!=','>','>=','<','<=' ---");
        $('#mart-filter-values-block').show();
        $('#mart-filter-min-max-block').hide();
      } else if (condition2.includes(condition_type_value)) {
        console.log('--- condition_type_value in "><","=><=" ---');
        $('#mart-filter-values-block').hide();
        $('#mart-filter-min-max-block').show();
      } else {
        $('#mart-filter-min-max-block').hide();
      }
    }

    // ------------------------------------------
    // Отрисовка окна для вывода содержимого (данных) таблицы
    jsPlumb.on(canvasElement, "tap", ".table-data-info", function (e) {
      console.info('---- table-data-info -> tap ---');

      //var metadata_node_id = $(this).parent().parent().attr("data-jtk-node-id");
      //var ar_metadata_node = metadata_node_id.split("_");
      //ar_metadata_node.splice(0, 1);
      //var metadata_name = ar_metadata_node.join("_");
      var metadata_info_object = $(this).parent().parent();
      var connect_id = metadata_info_object.children('input[name=connect_id]').val();
      var schema = metadata_info_object.children('input[name=schema]').val();
      var metadata_name = metadata_info_object.children('input[name=metadata_name]').val();
      var metadata_id = metadata_info_object.children('input[name=metadata_id]').val();

      renderModalViewMetadataData(connect_id, schema, metadata_name, 1,metadata_id);
    });

    // ------------------------------------------
    //
    $('#btn_viewMetadataData').on('click', function () {
      console.log('--- click btn_viewMetadataData ---');
      var connect_id = $('#edit_metadata_filter_connect_id').val();
      var schema = $('#edit_metadata_filter_schema').val();
      var metadata_name = $('#edit_metadata_filter_metadata_name').val();
      var metadata_id = $('#edit_metadata_filter_metadata_id').val();
      renderModalViewMetadataData(connect_id, schema, metadata_name, 1,metadata_id);
    });

    // ------------------------------------------
    //
    function renderModalViewMetadataData(connect_id, schema, metadata_name, page = 1,metadata_id) {
      // Показ модального окна с данными метаданного
      $('#modal_MartMetadataData #content_MartMetadataData').html('Загрузка содержимого ...');
      $("#modal_MartMetadataData").modal();
      $.ajax({
        url: `/meta-data/get-data/${metadata_id}`,
        method: "GET",
        dataType: "json",
        complete: function () {},
        success: function (data) {
          console.log(`ajax action 'get_metadata_for_connection_and_name' SUCCESS.`);
          const result = {
            metadata:data.metadata,
            table_data:data.data_json,
          }
          renderMartTableDataInfo(result);
        },
        error: function () {
          console.error(`ajax action 'get_metadata_for_connection_and_name' ERROR.`);
        }
      });
    }

    // ------------------------- / behaviour ----------------------------------

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // pan mode/select mode
    jsPlumb.on(controls, "tap", "[mode]", function () {
      console.info('---- [mode] -> tap ---');

      surface.setMode(this.getAttribute("mode"));
    });


    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // on home button click, zoom content to fit.
    jsPlumb.on(controls, "tap", "[select-all]", function () {
      console.info('---- [select-all] -> tap ---');

      toolkit.clearSelection();
      surface.zoomToFit(doNotAnimate = false);

      nodes = toolkit.getNodes();
      for (i = 0; i < nodes.length; i++) {
        setNodeSelected(nodes[i], true);
      }
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // on home button click, zoom content to fit.
    jsPlumb.on(controls, "tap", "[clear-all]", function () {
      console.info('---- [clear-all] -> tap ---');

      toolkit.clearSelection();
      surface.zoomToFit(doNotAnimate = false);

      nodes = toolkit.getNodes();
      for (i = 0; i < nodes.length; i++) {
        setNodeSelected(nodes[i], false);
      }
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // on home button click, zoom content to fit.
    jsPlumb.on(controls, "tap", "[listfilters]", function () {
      console.info('---- [listfilters] -> tap ---');
      $('#add_MetadataColumnFilter').hide();
      makeModalListMartMetadataFilters([]);
      //$('#modal_listMartFilters').modal();
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // on home button click, zoom content to fit.
    jsPlumb.on(controls, "tap", "[zoomtofit]", function () {
      console.info('---- [zoomtofit] -> tap ---');

      toolkit.clearSelection();
      surface.zoomToFit(doNotAnimate = false);
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    jsPlumb.on(controls, "tap", "[zoom-in]", function () {
      console.info('---- [zoom-in] -> tap ---');

      var zoom = surface.getZoom();
      zoom = 1.1 * zoom;
      surface.setZoom(zoom);
      console.debug(`zoom = ${zoom}`);
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    jsPlumb.on(controls, "tap", "[zoom-out]", function () {
      console.info('---- [zoom-out] -> tap ---');

      var zoom = surface.getZoom();
      zoom = 0.9 * zoom;
      surface.setZoom(zoom);
      console.debug(`zoom = ${zoom}`);
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    jsPlumb.on(controls, "tap", "[history_back]", function () {
      console.info('---- [history_back] -> tap ---');

      history.back();
    });

    // surface.bind("canvasClick", function (event) {
    // surface.magnetize({
    //   event: event
    // ------------------------ / rendering ------------------------------------

    // ------------------------ /loading  ------------------------------------
    function setHeightForJTKCanvas() {
      var window_height = window.innerHeight - 60;
      $(".jtk-demo-canvas").css("height", window_height);
    }
  });
}