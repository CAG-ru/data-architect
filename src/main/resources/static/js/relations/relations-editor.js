/*jshint esversion: 6 */
(function () {
  jsPlumbToolkit.ready(function () {

    // ------------------------ toolkit setup ------------------------------------
    $(".relations-editor-spinner").html(getSpinner());

    // This function is what the toolkit will use to get an ID from a node.
    var idFunction = function (n) {
      return n.id;
    };

    // This function is what the toolkit will use to get the associated type from a node.
    var typeFunction = function (n) {
      return n.type;
    };

    // get the various dom elements
    var mainElement = document.querySelector("#jtk-demo-dbase"),
      canvasElement = mainElement.querySelector(".jtk-demo-canvas"),
      miniviewElement = mainElement.querySelector(".miniview"),
      nodePalette = mainElement.querySelector(".node-palette"),
      controls = mainElement.querySelector(".controls");

    
    // Declare an instance of the Toolkit, and supply the functions we will use to get ids and types from nodes.
    var toolkit = jsPlumbToolkit.newInstance({
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
    var renderer = window.renderer = toolkit.render({
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
            autoSize: true,
            // maxSize: [600, 600],
            layout: {
              type: "Hierarchical",
              // absoluteBacked: true,
              magnetize: false,
              parameters: {
                // padding: [300, 300],
                // orientation: "vertical",
                // "align": "start",
                // "spacing": "auto",
                //   padding: [150, 150]
                // magnetize: {
                //   iterations: 50
                // }
              }
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
            anchor: ["Left", "Right"], // anchors for the endpoints
            endpoints: ["Dot", "Dot"],
            connector: "StateMachine", //  StateMachine connector type
            cssClass: "common-edge",
            events: {},
            overlays: []
          },
          // each edge type has its own overlays.
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
                label: "foreign key",
                location: 0.1
              }],
              ["Label", {
                label: "foreign key",
                location: 0.9
              }]
            ]
          },
          "Manual": {
            parent: "common",
            cssClass: "common-edge-manual",
            events: {
              "dbltap": function (params) {
                console.log("****** Manual dbltap *****");
                _editEdge(params.edge);
              }
            },
            overlays: [
              ["Label", {
                label: "ручная связь",
                location: 0.1
              }],
              ["Label", {
                label: "ручная связь",
                location: 0.9
              }],
              ["Label", {
                cssClass: "delete-relationship",
                label: "<i class='fa fa-times'></i>",
                events: {
                  "tap": function (params) {
                    console.log("****** removeEdge *****");
                    _removeEdge(params.edge);
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
                console.log("****** Auto dbltap *****");
                _editEdge(params.edge);
              }
            },
            overlays: [
              ["Label", {
                label: "авто-связь",
                location: 0.1
              }],
              ["Label", {
                label: "авто-связь",
                location: 0.9
              }],
              ["", {
                cssClass: "delete-relationship",
                label: "<i class='fa fa-times'></i>",
                events: {
                  "tap": function (params) {
                    console.log("****** Label tap *****");
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
            paintStyle: {
              fill: "#f76258"
            }, // the endpoint's appearance
            hoverPaintStyle: {
              fill: "#434343"
            }, // appearance when mouse hovering on endpoint or connection
            edgeType: "common", // the type of edge for connections from this port type
            maxConnections: -1, // no limit on connections
            dropOptions: { //drop options for the port. here we attach a css class.
              hoverClass: "drop-hover"
            },
            events: {
              "dblclick": function () {
                console.log(arguments);
              }
            }
          }
        }
      },
      // Layout the nodes using a 'Spring' (force directed) layout. This is the best layout in the jsPlumbToolkit
      // for an application such as this.
      layout: {
        type: "Circular",
        // absoluteBacked: false,
        // magnetize: true,
        parameters: {
          // centerRootNode: true,
          padding: 20,
          // padding: [30, 30],
          // "orientation": "vertical",
          // "align": "start",
          // "spacing": "auto",
          //   padding: [150, 150]
          // magnetize: {
          //   iterations: 50
          // }
        }
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
          console.log("****** edgeAdded *****");
          if (params.addedByMouse) {
            _editEdge(params.edge, true);
          }
        },
        canvasClick: function (e) {
          toolkit.clearSelection();
        }
      },
      dragOptions: {
        filter: "i, .view .buttons, .table .buttons, .table-column *, .view-edit, .edit-name, .delete, .add, .btn-close-table-data-content, .table-data-info"
      },
      zoomToFit: true,
      refreshLayoutOnEdgeConnect: true,
    });

    // listener for mode change on renderer.
    renderer.bind("modeChanged", function (mode) {
      jsPlumb.removeClass(controls.querySelectorAll("[mode]"), "selected-mode");
      jsPlumb.addClass(controls.querySelectorAll("[mode='" + mode + "']"), "selected-mode");
    });
    /*
            var undoredo = window.undoredo = new jsPlumbToolkitUndoRedo({
                surface:renderer,
                onChange:function(undo, undoSize, redoSize) {
                    controls.setAttribute("can-undo", undoSize > 0);
                    controls.setAttribute("can-redo", redoSize > 0);
                },
                compound:true
            });
    */  
    var deleted_edges = [];
    // ------------------------------------------
    // edit an edge's detail
    var _editEdge = function (edge, isNew) {
      console.log("****** _editEdge *****");

      jsPlumbToolkit.Dialogs.show({
        id: "dlgRelationshipType",
        data: edge.data,
        labels: {
          ok: "Сохранить",
          cancel: "Отмена",
        },
        onOpen: function (data) {
          //console.log(edge.source);
          //console.log(edge.source.getNode().data);
          var source_table_name = edge.source.getNode().data['table_name'];
          //console.log('source_table_name='+source_table_name);
          $("#dlg_relation_source_table_name").text(source_table_name);
          //var source_table_title = edge.source.getNode().data['table_title'];
          //console.log('source_table_title='+source_table_title);
          //$("#dlg_relation_source_table_title").text(source_table_title);
          var source_column_name = edge.source.data['id'];
          //console.log('source_column_name='+source_column_name);
          $("#dlg_relation_source_column_name").text(source_column_name);
          //var source_column_title = edge.source.data['id'];
          //console.log('source_column_title='+source_column_title);
          //$("#dlg_relation_source_table_title").text(source_column_title);

          var target_table_name = edge.target.getNode().data['table_name'];
          //console.log('target_table_name='+target_table_name);
          $("#dlg_relation_target_table_name").text(target_table_name);
          //var target_table_title = edge.target.getNode().data['table_title'];
          //console.log('target_table_title='+target_table_title);
          //$("#dlg_relation_target_table_title").text(target_table_title);
          var target_column_name = edge.target.data['id'];
          //console.log('target_column_name='+target_column_name);
          $("#dlg_relation_target_column_name").text(target_column_name);
          //var target_column_title = edge.target.data['id'];
          //console.log('target_column_title='+target_column_title);
          //$("#dlg_relation_target_column_title").text(target_column_title);
        },
        onOK: function (data) {
          // update the type in the edge's data model...it will be re-rendered.
          // `type` is set in the radio buttons in the dialog template.
          //console.log(edge.source.getNode().data.data);
          // При создании новой связи по умолчанию аттрибуты с id источника не создаются, их нужно прописать
          edge.data.source_connect_id = edge.source.getNode().data.data.connect_id;
          //console.log(edge.target.getNode().data.data);
          edge.data.dest_connect_id = edge.target.getNode().data.data.connect_id;
          //console.log(edge);
          toolkit.updateEdge(edge, data);
        },
        onCancel: function () {
          // if the user pressed cancel on a new edge, delete the edge.
          if (isNew) toolkit.removeEdge(edge);
        }
      });
    };

    var _removeEdge = function (params_edge) {
      console.log("****** _removeEdge *****");
      addEdgeToRemoveEdges(params_edge);
      toolkit.removeEdge(params_edge);
    };

    function addEdgeToRemoveEdges(params_edge) {
      if((typeof(params_edge.data) != 'undefined') &&
      (params_edge.data.relation_id != null)) {
        deleted_edges.push(params_edge.data.relation_id);
      }
    }
    // ------------------------- behaviour ----------------------------------

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Отрисовка окна для вывода содержимого (данных) таблицы
    jsPlumb.on(canvasElement, "tap", ".table-data-info", function (e) {
      console.log('---- table-data-info -> tap ---');

      $('#content_RelationMetadataData').html('Загрузка содержимого ...');
      $("#modal_RelationMetadataData").modal();
      var metadata_node_id = $(this).parent().parent().attr("data-jtk-node-id");
      var ar_metadata_node = metadata_node_id.split("_");
      var metadata_cid = ar_metadata_node[0];
      ar_metadata_node.splice(0, 1);
      var metadata_name = ar_metadata_node.join("_");
      $.ajax({
        url: `${location.href}`,
        method: "POST",
        dataType: "json",
        data: {
          "action": "get_metadata_for_connection_and_name",
          "cid": metadata_cid,
          "name_metadata": metadata_name,
        },
        complete: function () {},
        success: function (data) {
          console.log(`ajax action 'table-data-info' SUCCESS.`);
          renderRelationTableDataInfo(data);
        },
        error: function () {
          console.error(`ajax action 'get_metadata' ERROR.`);

        }
      });

    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // delete column button
    jsPlumb.on(canvasElement, "tap", ".table-column-delete, .table-column-delete i", function (e) {
      console.log("****** .table-column-delete, .table-column-delete i *****");

      jsPlumbUtil.consume(e);
      var info = renderer.getObjectInfo(this);
      jsPlumbToolkit.Dialogs.show({
        id: "dlgConfirm",
        data: {
          msg: "Delete column '" + info.obj.data.name + "'"
        },
        onOK: function (data) {
          toolkit.removePort(info.obj.getNode(), info.id);
        },
        onOpen: function (el) {
          console.dir(el);
        }
      });
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // add new column to table
    jsPlumb.on(canvasElement, "tap", ".new-column, .new-column i", function (e) {
      console.log("****** tap .new-column, .new-column i *****");

      jsPlumbUtil.consume(e);
      var // getObjectInfo is a helper method that retrieves the node or port associated with some
        // element in the DOM.
        info = renderer.getObjectInfo(this);

      jsPlumbToolkit.Dialogs.show({
        id: "dlgColumnEdit",
        title: "Column Details",
        onOK: function (data) {
          // if the user supplied a column name, tell the toolkit to add a new port, providing it the
          // id and name of the new column.  This will result in a callback to the portFactory defined above.
          if (data.name) {
            if (data.name.length < 2)
              alert("Column names must be at least 2 characters!");
            else {
              toolkit.addNewPort(info.id, "column", {
                id: jsPlumbUtil.uuid(),
                name: data.name.replace(" ", "_").toLowerCase(),
                primaryKey: data.primaryKey,
                datatype: data.datatype
              });
            }
          }
        }
      });
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // delete a table or view
    jsPlumb.on(canvasElement, "tap", ".delete, .view-delete", function (e) {
      console.log("****** tap .delete, .view-delete *****");

      jsPlumbUtil.consume(e);
      var info = renderer.getObjectInfo(this);

      jsPlumbToolkit.Dialogs.show({
        id: "dlgConfirm",
        data: {
          msg: "Delete '" + info.id
        },
        onOK: function (data) {
          toolkit.removeNode(info.id);
        }
      });

    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // edit a view's query
    jsPlumb.on(canvasElement, "tap", ".view .view-edit i", function (e) {
      console.log("****** tap .view .view-edit i *****");

      jsPlumbUtil.consume(e);
      var info = renderer.getObjectInfo(this);
      jsPlumbToolkit.Dialogs.show({
        id: "dlgViewQuery",
        data: info.obj.data,
        onOK: function (data) {
          // update data, and UI (which works only if you use the Toolkit's default template engine, Rotors.
          toolkit.updateNode(info.obj, data);
        }
      });
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // change a view or table's name
    jsPlumb.on(canvasElement, "tap", ".edit-name", function (e) {
      console.log("****** tap edit-name *****");

      jsPlumbUtil.consume(e);
      // getObjectInfo is a method that takes some DOM element (this function's `this` is
      // set to the element that fired the event) and returns the toolkit data object that
      // relates to the element.
      var info = renderer.getObjectInfo(this);
      jsPlumbToolkit.Dialogs.show({
        id: "dlgName",
        data: info.obj.data,
        title: "Edit " + info.obj.data.type + " name",
        onOK: function (data) {
          if (data.name && data.name.length > 2) {
            // if name is at least 2 chars long, update the underlying data and
            // update the UI.
            toolkit.updateNode(info.obj, data);
          }
        }
      });
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // edit a column's details
    jsPlumb.on(canvasElement, "tap", ".table-column-edit i", function (e) {
      console.log("****** tap table-column-edit i *****");

      jsPlumbUtil.consume(e);
      var info = renderer.getObjectInfo(this);
      jsPlumbToolkit.Dialogs.show({
        id: "dlgColumnEdit",
        title: "Column Details",
        data: info.obj.data,
        onOK: function (data) {
          // if the user supplied a column name, tell the toolkit to add a new port, providing it the
          // id and name of the new column.  This will result in a callback to the portFactory defined above.
          if (data.name) {
            if (data.name.length < 2)
              jsPlumbToolkit.Dialogs.show({
                id: "dlgMessage",
                msg: "Column names must be at least 2 characters!"
              });
            else {
              toolkit.updatePort(info.obj, {
                name: data.name.replace(" ", "_").toLowerCase(),
                primaryKey: data.primaryKey,
                datatype: data.datatype
              });
            }
          }
        }
      });
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // pan mode/select mode
    jsPlumb.on(controls, "tap", "[mode]", function () {
      console.log("****** tap mode *****");

      renderer.setMode(this.getAttribute("mode"));
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    jsPlumb.on(controls, "tap", "[autosize]", function () {
      console.log("****** tap autosize *****");
      renderer.zoomToFit({
        fill: 0.8,
        doNotAnimate: true,
      });
      renderer.centerContent({
        doNotAnimate: true,
      });
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // on home button click, zoom content to fit.
    jsPlumb.on(controls, "tap", "[zoomtofit]", function () {
      console.log("****** tap zoomtofit *****");

      //toolkit.clearSelection();
      // renderer.zoomToFit();
      //renderer.zoomToFit({
      //  fill: 0.8,
      //  doNotAnimate: true,
        // onComplete: function () {
        //   alert("done!");
        // }
      //});
      renderer.zoomToVisible({
        doNotAnimate: true,
      });
      renderer.centerContent({
        doNotAnimate: true,
      });
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // on home button click, zoom content to fit.
    jsPlumb.on(controls, "tap", "[save]", function () {
      console.log("****** tap save *****");

      let csrf_token = $("input[name=csrfmiddlewaretoken]").val();
      let ar_cid = $("#ar_cid").val();
      let data = {};
      data.deleted_edges = deleted_edges;
      toolkit.save({
        type: "json",
        url: "/relations/save/",
        data: data,
        parameters: {
          "csrf_token": csrf_token,
          "csrfmiddlewaretoken": csrf_token,
        },
        success: function () {},
        error: function () {},
        headers: {
          "X-CSRFToken": csrf_token
        }
      });
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    jsPlumb.on(controls, "tap", "[zoom-in]", function () {
      console.log("****** tap zoom-in *****");

      let zoom = renderer.getZoom();
      zoom = 1.1 * zoom;
      renderer.setZoom(zoom);
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    jsPlumb.on(controls, "tap", "[zoom-out]", function () {
      console.log("****** tap zoom-out *****");

      let zoom = renderer.getZoom();
      zoom = 0.9 * zoom;
      renderer.setZoom(zoom);
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    jsPlumb.on(controls, "tap", "[history_back]", function () {
      console.log("****** tap history_back *****");

      window.location.href = '/relations/';
    });

    // ------------------------ / rendering ------------------------------------


    // ------------------------ drag and drop new tables/views -----------------

    //
    // Here, we are registering elements that we will want to drop onto the workspace and have
    // the toolkit recognise them as new nodes.
    //
    //  typeExtractor: this function takes an element and returns to jsPlumb the type of node represented by
    //                 that element. In this application, that information is stored in the 'jtk-node-type' attribute.
    //
    //  dataGenerator: this function takes a node type and returns some default data for that node type.
    //
    /*
            new SurfaceDropManager({
                source:nodePalette,
                selector:"[data-node-type]",
                surface:renderer,
                dataGenerator: function (el) {
                    return {
                        name:el.getAttribute("data-node-type"),
                        type:el.getAttribute("data-node-type")
                    };
                },
                allowDropOnEdge:false
            });
    */
    // ------------------------ / drag and drop new tables/views -----------------
    /*
            var datasetView = new jsPlumbSyntaxHighlighter(toolkit, ".jtk-demo-dataset");
    */
    // ------------------------ loading  ------------------------------------
    // Load the data.
    console.log("****** Load the data *****");
    let ar_cid = $("#ar_cid").val().replace(/[\[\]]/g,"");
    console.log(ar_cid);
    let ar_tables = $("#ar_tables").val();
    toolkit.load({
      url: "/relations/load/?" + encodeURI(ar_cid.split(", ").map(id=>`cid[]=${id}`).join("&")),
      onload: function () {
        console.log("****** Load the data - success *****");

        $(".relations-editor-spinner").remove();
        setHeightForJTKCanvas();
        // renderer.setZoom(0.3);
        // surface.zoomToVisible();
        renderer.centerContent();
        renderer.zoomToFit({
          fill: 0.8,
          doNotAnimate: true,
          // onComplete: function () {
          //   alert("done!");
          // }
        });
        // renderer.zoomToVisible();
        // renderer.setZoom(0.1);
      }
    });
    // ------------------------ /loading  ------------------------------------

    // switch-relations-type

    $('.switch-relations-type > input').on('click', function() {
      let relation_type = $(this).attr('id');
      console.log(relation_type);
      let is_relation_checked = $(this).is(':checked');
      console.log(is_relation_checked);
      toggleRelationVisible(toolkit, renderer, relation_type, is_relation_checked);
    });

  });
})();

function toggleRelationVisible(toolkit, renderer, relation_type, is_relation_checked) {
  //var relation_type_stroke = 'none';
  //if(is_relation_checked) {
    switch(relation_type) {
      case 'edge-fkey':
        relation_type = 'Fkey';
        break;
      case 'edge-auto':
        relation_type = 'Auto';
        break;
      case 'edge-manual':
        relation_type = 'Manual';
        break;
    }
    var selected_edges = toolkit.filter(function(obj) {
      return (obj.objectType === "Edge" && obj.data.type == relation_type); 
    });
    renderer.setVisible(selected_edges, is_relation_checked);
  //}
}


function setHeightForJTKCanvas() {
  var window_height = window.innerHeight - 60;
  $(".jtk-demo-canvas").css("height", window_height);
}

//
// ------------------------------------------
function renderRelationTableDataInfo(data) {
  console.info('*** renderRelationTableDataInfo ***');
  //console.log(`ajax action 'get_metadata' SUCCESS. data = ${data}`);
  if (data.length != 0) {
    //emptySourceTableTab('#table-data-content');

    metadata = data.metadata;

    metadata_fkeys = metadata.fkey;
    fkey_names = Object.keys(metadata_fkeys);
    fkey_datas = Object.values(metadata_fkeys);

    metadata_columns = metadata.columns;
    column_names = Object.keys(metadata_columns);
    column_datas = Object.values(metadata_columns);
    // columns = data.columns;
    //console.log(data.table_data);
    table_data = JSON.parse(data.table_data);
    //console.log(table_data);

    // ====
    // table data
    $('#content_RelationMetadataData').html('Загрузка содержимого ...');
    if (table_data) {
      $('#content_RelationMetadataData').html("<h4>" + metadata.name + "</h4>");
      $('#content_RelationMetadataData').append(tableDataView = $('<table/>'));
      tableDataView
        .attr('id', 'table_data_view')
        .addClass('table table-hover table-bordered')
        .append($('<caption/>')
          .append(Object.keys(table_data).length == 0 ? 'Пустая таблица' : 'Максимум первые 10 строк'))
        .append(tableHeader = $('<thead/>').addClass("thead-dark"))
        .append(tableBody = $('<tbody/>'));

      // Header
      tableHeader.append(tableHeaderRow = $('<tr/>'));
      for (let i = 0; i < column_names.length; i++) {
        tableHeaderRow.append($('<th/>').append(column_names[i]));
      }

      col_data = table_data[column_names[0]];
      //kk = Object.keys(col_data);
      // body
      for (let k = 0; k < Object.keys(table_data[column_names[0]]).length; k++) {
        tableBody.append(tableDataRow = $('<tr/>'));
        for (let i = 0; i < column_names.length; i++) {
          val = Object.values(table_data[column_names[i]])[k];
          tableDataRow.append($('<td/>').append(Object.values(table_data[column_names[i]])[k]));
        }
      }
    } else {
      $('content_RelationMetadataData').append("Таблица не содержит данных");
    }



  }
}