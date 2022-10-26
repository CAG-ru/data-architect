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
    var idFunction = function (n) {
      return n.id;
    };

    // This function is what the toolkit will use to get the associated type from a node.
    var typeFunction = function (n) {
      return n.type;
    };

    // get the various dom elements
    var mainElement = document.querySelector("#jtk-demo-dbase");
    if (mainElement == null) {
      console.warn('Нет элемента на странице для отображения');
      return;
    }
    var canvasElement = mainElement.querySelector(".jtk-demo-canvas");
    // Очистим область 
    $(".jtk-demo-canvas").empty();

    var miniviewElement = mainElement.querySelector(".miniview");
    var nodePalette = mainElement.querySelector(".node-palette");
    var controls = mainElement.querySelector(".controls");

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
              } else {
                alert(type + " names must be at least 2 characters!");
              }
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
    var surface = window.renderer = toolkit.render({
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
            anchor: ["Left", "Right"], // anchors for the endpoints
            endpoints: ["Dot", "Dot"],
            connector: "Bezier", //  StateMachine connector type
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
        type: "Hierarchical",
        parameters: {
          padding: [30, 30],
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
        filter: "i, .view .buttons, .table .buttons, .table-column *, .view-edit, .edit-name, .delete, .add, .btn-close-table-data-content, .table-data-info .table_select .column_select"
        // filter: ""
      },
      zoomToFit: true
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

    // ------------------------- behaviour ----------------------------------
    // ------------------------------------------
    // Enable toolkit for dinamical objects
    jsPlumb.on(canvasElement, "mouseover", function (e) {
      console.info('---- table_select -> mouseover ---');
      var info = renderer.getObjectInfo(this);
      $(this).tooltip();
    });

    // ------------------------------------------
    jsPlumb.on(canvasElement, "tap", ".table_select", function (e) {
      console.info('---- table_select -> tap ---');

      jsPlumbUtil.consume(e);
      var info = renderer.getObjectInfo(this);
      var data = info.obj.data;

      data.selected = !data.selected;
      toolkit.updateNode(info.obj, data);
      // surface.zoomToFitIfNecessary();
      sel = toolkit.select(info.obj);
      surface.zoomToSelection();
      // toolkit.clearSelection();
      // var metadata_node_id = $(this).parent().parent().attr("data-jtk-node-id");
      // nodes = json_data.nodes;

    });

    // ------------------------------------------
    jsPlumb.on(canvasElement, "tap", ".column_select", function (e) {
      console.info('---- column_select -> tap ---');

      jsPlumbUtil.consume(e);
      var info = renderer.getObjectInfo(this);
      var data = info.obj.data;

      data.selected = !data.selected;
      toolkit.updateNode(info.obj, data);

    });

    // ------------------------------------------
    // Отрисовка окна для вывода содержимого (данных) таблицы
    jsPlumb.on(canvasElement, "tap", ".table-data-info", function (e) {
      console.info('---- table-data-info -> tap ---');

      $("#table-data-content").show();
      $("#table-data-content").children(".tab-content").html("Загрузка содержимого таблицы ...");
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
          "id": metadata_cid,
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
    // $(".btn-close-table-data-content").click(function () {
    //   //jsPlumb.on(canvasElement, "tap", ".btn-close-table-data-content", function(e) {
    //   console.info('---- btn-close-table-data-content -> click ---');

    //   $("#table-data-content").children(".tab-content").html("Загрузка ...");
    //   $("#table-data-content").hide();
    // });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // delete column button
    // jsPlumb.on(canvasElement, "tap", ".table-column-delete, .table-column-delete i", function (e) {
    //   console.info('---- table-column-delete -> tap ---');

    //   jsPlumbUtil.consume(e);
    //   var info = surface.getObjectInfo(this);
    //   jsPlumbToolkit.Dialogs.show({
    //     id: "dlgConfirm",
    //     data: {
    //       msg: "Delete column '" + info.obj.data.name + "'"
    //     },
    //     onOK: function (data) {
    //       toolkit.removePort(info.obj.getNode(), info.id);
    //     },
    //     onOpen: function (el) {
    //       console.dir(el);
    //     }
    //   });
    // });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // add new column to table
    // jsPlumb.on(canvasElement, "tap", ".new-column, .new-column i", function (e) {
    //   console.info('---- new-column -> tap ---');

    //   jsPlumbUtil.consume(e);
    //   var // getObjectInfo is a helper method that retrieves the node or port associated with some
    //     // element in the DOM.
    //     info = surface.getObjectInfo(this);

    //   jsPlumbToolkit.Dialogs.show({
    //     id: "dlgColumnEdit",
    //     title: "Column Details",
    //     onOK: function (data) {
    //       // if the user supplied a column name, tell the toolkit to add a new port, providing it the
    //       // id and name of the new column.  This will result in a callback to the portFactory defined above.
    //       if (data.name) {
    //         if (data.name.length < 2)
    //           alert("Column names must be at least 2 characters!");
    //         else {
    //           toolkit.addNewPort(info.id, "column", {
    //             id: jsPlumbUtil.uuid(),
    //             name: data.name.replace(" ", "_").toLowerCase(),
    //             primaryKey: data.primaryKey,
    //             datatype: data.datatype
    //           });
    //         }
    //       }
    //     }
    //   });
    // });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // delete a table or view
    // jsPlumb.on(canvasElement, "tap", ".delete, .view-delete", function (e) {
    //   console.info('---- delete -> tap ---');

    //   jsPlumbUtil.consume(e);
    //   var info = surface.getObjectInfo(this);

    //   jsPlumbToolkit.Dialogs.show({
    //     id: "dlgConfirm",
    //     data: {
    //       msg: "Delete '" + info.id
    //     },
    //     onOK: function (data) {
    //       toolkit.removeNode(info.id);
    //     }
    //   });

    // });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // edit a view's query
    // jsPlumb.on(canvasElement, "tap", ".view .view-edit i", function (e) {
    //   console.info('---- view -> tap ---');

    //   jsPlumbUtil.consume(e);
    //   var info = surface.getObjectInfo(this);
    //   jsPlumbToolkit.Dialogs.show({
    //     id: "dlgViewQuery",
    //     data: info.obj.data,
    //     onOK: function (data) {
    //       // update data, and UI (which works only if you use the Toolkit's default template engine, Rotors.
    //       toolkit.updateNode(info.obj, data);
    //     }
    //   });
    // });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // change a view or table's name
    // jsPlumb.on(canvasElement, "tap", ".edit-name", function (e) {
    //   console.info('---- edit-name -> tap ---');

    //   jsPlumbUtil.consume(e);
    //   // getObjectInfo is a method that takes some DOM element (this function's `this` is
    //   // set to the element that fired the event) and returns the toolkit data object that
    //   // relates to the element.
    //   var info = surface.getObjectInfo(this);
    //   jsPlumbToolkit.Dialogs.show({
    //     id: "dlgName",
    //     data: info.obj.data,
    //     title: "Edit " + info.obj.data.type + " name",
    //     onOK: function (data) {
    //       if (data.name && data.name.length > 2) {
    //         // if name is at least 2 chars long, update the underlying data and
    //         // update the UI.
    //         toolkit.updateNode(info.obj, data);
    //       }
    //     }
    //   });
    // });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // edit an edge's detail
    // var _editEdge = function (edge, isNew) {
    //   console.info('---- _editEdge ---');

    //   jsPlumbToolkit.Dialogs.show({
    //     id: "dlgRelationshipType",
    //     data: edge.data,
    //     onOK: function (data) {
    //       // update the type in the edge's data model...it will be re-rendered.
    //       // `type` is set in the radio buttons in the dialog template.
    //       //console.log(edge.source.getNode().data.data);
    //       // При создании новой связи по умолчанию аттрибуты с id источника не создаются, их нужно прописать
    //       edge.data['source_connect_id'] = edge.source.getNode().data.data['connect_id'];
    //       //console.log(edge.target.getNode().data.data);
    //       edge.data['dest_connect_id'] = edge.target.getNode().data.data['connect_id'];
    //       //console.log(edge);
    //       toolkit.updateEdge(edge, data);
    //     },
    //     onCancel: function () {
    //       // if the user pressed cancel on a new edge, delete the edge.
    //       if (isNew) toolkit.removeEdge(edge);
    //     }
    //   });
    // };

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // edit a column's details
    // jsPlumb.on(canvasElement, "tap", ".table-column-edit i", function (e) {
    //   console.info('---- table-column-edit -> tap ---');

    //   jsPlumbUtil.consume(e);
    //   var info = surface.getObjectInfo(this);
    //   jsPlumbToolkit.Dialogs.show({
    //     id: "dlgColumnEdit",
    //     title: "Column Details",
    //     data: info.obj.data,
    //     onOK: function (data) {
    //       // if the user supplied a column name, tell the toolkit to add a new port, providing it the
    //       // id and name of the new column.  This will result in a callback to the portFactory defined above.
    //       if (data.name) {
    //         if (data.name.length < 2)
    //           jsPlumbToolkit.Dialogs.show({
    //             id: "dlgMessage",
    //             msg: "Column names must be at least 2 characters!"
    //           });
    //         else {
    //           toolkit.updatePort(info.obj, {
    //             name: data.name.replace(" ", "_").toLowerCase(),
    //             primaryKey: data.primaryKey,
    //             datatype: data.datatype
    //           });
    //         }
    //       }
    //     }
    //   });
    // });

    // ------------------------- / behaviour ----------------------------------

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // pan mode/select mode
    jsPlumb.on(controls, "tap", "[mode]", function () {
      console.info('---- [mode] -> tap ---');

      surface.setMode(this.getAttribute("mode"));
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // on home button click, zoom content to fit.
    jsPlumb.on(controls, "tap", "[save]", function () {
      console.info('---- [save] -> tap ---');

      console.log("Сохранить!");
      csrf_token = $("input[name=csrfmiddlewaretoken]").val();
      var ar_cid = $("#ar_cid").val();
      toolkit.save({
        type: "json",
        url: "/relations/save/?ar_cid=" + ar_cid,
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
    // on home button click, zoom content to fit.
    jsPlumb.on(controls, "tap", "[zoomtofit]", function () {
      console.info('---- [zoomtofit] -> tap ---');

      toolkit.clearSelection();
      // surface.zoomToVisible();
      // surface.zoomToFitIfNecessary();
      surface.setZoom(1);
      // surface.zoomToFit({
      //   fill: 0.8,
      //   doNotAnimate: false,
      //   onComplete: function () {
      //     alert("done!");
      //   }
      // });
      // console.debug(`zoom = ${zoom}`);
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

    surface.bind("canvasClick", function (event) {
      surface.magnetize({
        event: event
      });
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
                surface:surface,
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


    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Load the data.
    console.info('---- Load the data ---');
    toolkit.load({
      type: 'json',
      data: json_data,
      onload: function () {
        $(".relations-editor-spinner").remove();
        setHeightForJTKCanvas();
        surface.setZoom(0.6);
        // surface.zoomToVisible();
        surface.centerContent();
        surface.magnetize();
      }
    });


    // ------------------------ /loading  ------------------------------------
    function setHeightForJTKCanvas() {
      var window_height = window.innerHeight - 60;
      $(".jtk-demo-canvas").css("height", window_height);
    }



  });
}