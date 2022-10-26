
// ------------------------------------------
// Диаграмма в виде дерева с помощью библиотеки D3
export function viewTreeDiagramD3(data) {
  console.info('---- viewTreeDiagramD3 ---');

  var scrollHeight = Math.max(
    document.body.scrollHeight, document.documentElement.scrollHeight,
    document.body.offsetHeight, document.documentElement.offsetHeight,
    document.body.clientHeight, document.documentElement.clientHeight
  );
  var scrollWidth = document.documentElement.clientWidth;

  margin = ({
    top: 10,
    right: 20,
    bottom: 10,
    left: 40
  });

  var width = scrollWidth,
    height = scrollHeight;

  var max_dept =0;  
  // Расстояние между шариками по вертикали 
  dx = 35;
  // расстояние по горизонтали
  dy = width / 6;

  all_nodes = data.descendants();
  num_nodes = all_nodes.length;

  // console.debug(`height = ${height}`);
  // console.debug(`num_nodes = ${num_nodes}`);
  // console.debug(`num_nodes * dx + 50 = ${num_nodes * dx + 50}`);

  height = Math.max(height, num_nodes * dx + 50);

  d3.select("#d3_diagram").style('height', height + 'px');

  tree = d3.tree().nodeSize([dx, dy]);
  treeLink = d3.linkHorizontal().x(d => d.y).y(d => d.x);

  graph(data);

  w = d3.select("#d3_diagram_svg").style('width');
  console.debug(`w =  ${w}`);
  w2 = d3.select("#d3_diagram").style('width');
  console.debug(`w2 =  ${w2}`);
  // ------------------------------------------
  function graph(root, {
    name = d => d.data.name,
    comment = d => d.data.comment,
    short_comment = d => d.data.comment.length > 25 ? d.data.comment.slice(0, 25) + '...' : d.data.comment,
    description = d => d.data.description,
    tooltip_title = d => d.data.comment + '\n' + d.data.description,
    // highlight = () => false,
    highlight = d => d.data.selected,
    node_type = d => d.data.type,
    marginLeft = 200
  } = {}) {
    root = tree(root);

    // highlight = (1, 2)
    let x0 = Infinity;
    let x1 = -x0;
    root.each(d => {
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
      max_dept = Math.max(max_dept, d.depth);
    });

    // d3.select("#d3_diagram").style('width', max_dept*dy);

    // const svg = d3.create("svg")
    const svg = d3.select("#d3_diagram").append('svg')
      .attr('id', 'd3_diagram_svg')
      .style('width', (max_dept+2) * dy)
      // .attr("viewBox", [0, 0, width, x1 - x0 + dx * 2])
      .style("overflow", "visible");

    update(root);


    // Кнопки
    const buttons = svg.append('g')
      .attr("font-family", "inherit")
      .attr("font-size", 14)
      .attr("ont-weight", 400)
      .attr("cursor", "pointer")
      .attr("pointer-events", "all");

    const ButtonClearSelected = buttons.append('g')
      .on("click", clickButtonClearSelected)
      .on("mouseover", function (d) {
        ButtonClearSelectedRect.attr("fill", '#28a745');
        ButtonClearSelectedText.attr("fill", 'white');
      })
      .on("mouseout", function (d) {
        ButtonClearSelectedRect.attr("fill", 'transparent'); //   // d3.select(this).attr("fill", "transparent");
        ButtonClearSelectedText.attr("fill", '#28a745');
      });

    const ButtonClearSelectedRect = ButtonClearSelected.append("rect")
      // .attr("fill", d => highlight(d) ? '#28a745' : d.children ? "#777" : "#999")
      .attr("fill", "transparent")
      // атрибуты 
      .attr("stroke", '#28a745')
      .attr("rx", "3.2px")
      .attr("ry", "3.2px")
      .attr("width", 130)
      .attr("height", 31);

    const ButtonClearSelectedText = ButtonClearSelected.append('text')
      .attr("dy", "1.4em")
      .attr("x", 14)
      .attr('fill', '#28a745')
      .text('Снять пометку');

    const ButtonSelectAll = buttons.append('g')
      .attr("fill", "transparent")
      .attr("transform", `translate(${140},${0})`)
      .on("click", clickButtonSelectAll)
      .on("mouseover", function (d) {
        ButtonSelectAllRect.attr("fill", '#28a745');
        ButtonSelectAllText.attr("fill", 'white');
      })
      .on("mouseout", function (d) {
        ButtonSelectAllRect.attr("fill", 'transparent'); //   // d3.select(this).attr("fill", "transparent");
        ButtonSelectAllText.attr("fill", '#28a745');
      });

    const ButtonSelectAllRect = ButtonSelectAll.append("rect")
      // .attr("fill", d => highlight(d) ? '#28a745' : d.children ? "#777" : "#999")
      // атрибуты 
      .attr("stroke", '#28a745')
      .attr("rx", "3.2px")
      .attr("ry", "3.2px")
      .attr("width", 120)
      .attr("height", 31);

    const ButtonSelectAllText = ButtonSelectAll.append('text')
      .attr("dy", "1.4em")
      .attr("x", 14)
      .attr('fill', '#28a745')
      .text('Пометить все');

    // ------------------------------------------
    function update(source) {
      console.info('---- update ---');
      const duration = d3.event && d3.event.altKey ? 2500 : 250;
      const nodes = root.descendants().reverse();
      const links = root.links();
      tree(root);

      // Обновим у глобального набора выбранные элементы
      data.descendants().forEach(element => {
        for (let i = 0; i < _root_diagram_data.length; i++) {
          const el = _root_diagram_data[i];
          if (el.id == element.data.id) {
            el.selected = element.data.selected;
          }
        }
      });

      // Обшщая группа для всех элемментов с общими характеристиками
      const g = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 16)
        .attr("transform", `translate(${marginLeft},${dx - x0})`);

      const gLink = g.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 1)
        .attr("stroke-width", 1.5)
        .selectAll("path") // ? не понятно
        .data(root.links())
        .join("path") // ? не понятно
        .attr("stroke", d => highlight(d.source) && highlight(d.target) ? '#28a745' : null)
        .attr("stroke-opacity", d => highlight(d.source) && highlight(d.target) ? 1 : null)
        .attr("d", treeLink); // ? не понятно

      // Узлы
      const gNode = g.append("g")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .selectAll("g") // ? не понятно
        .data(root.descendants())
        .join("g") // ? не понятно
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .attr("cursor", "pointer")
        .attr("pointer-events", "all")
        // .on("click", checkNode)
        .attr('id', d => d.id)
        .attr('data-toggle', 'tooltip')
        .attr('title', tooltip_title)
        // .attr('title', d => d.data.description.length ? d.data.description : "Описание отсутствует")
        .on("click", checkNode)
        .on("mouseover", function (d) {
          console.debug(`mouseover: id = ${d.id}`);
          $(`#${d.id}`).tooltip();
        });

      gNode.append("circle")
        .attr("fill", d => highlight(d) ? '#28a745' : d.children ? "#555" : "#999")
        // Диаметр шарика
        .attr("r", d => d.data.type == 'column' ? 9 : d.data.type == 'entity' ? 5 : 20)
        // Размер прямоугольника
        .attr("width", 9)
        .attr("height", 9);
      // .attr("data-toggle","tooltip")
      // .attr("title", "Привет! Это я!")

      // gNode.append("rect")
      //   .attr("fill", d => highlight(d) ? '#28a745' : d.children ? "#777" : "#999")
      //   // .attr("fill", "#777")
      //   // атрибуты 
      //   // .attr("stroke", "black")
      //   // .attr("rx", 5)
      //   // .attr("ry", 5)
      //   .attr("width", 9)
      //   .attr("height", 9)


      gNode.append("text")
        .attr("fill", d => highlight(d) ? '#28a745' : (d => d.data.type == 'metadata' ? '#2350b1' : null))
        .attr("dy", "0.20em") // Смещение по вертикали
        .attr("x", d => d.children ? -12 : 12)
        .attr("text-anchor", d => d.data.type == 'metadata' ? "end" : "start")
        .text(short_comment)
        .clone(true).lower() // ? не понятно
        .attr("stroke", "white");

      gNode.append("text")
        .attr("fill", d => highlight(d) ? '#28a745' : null)
        // .style("font-family","verdana")
        .style("font-size", "80%")
        .attr("dy", "1.31em") // Смещение по вертикали
        .attr("x", d => d.children ? -12 : 12)
        .attr("text-anchor", d => d.data.type == 'metadata' ? "end" : "start")
        .text(name)
        .clone(true).lower() // ? не понятно
        .attr("stroke", "white");

      checkSelected();
      bindViewDiagramScrollTop();
    }



    // ------------------------------------------
    function changeSelected(selected) {
      console.info('---- view_diagram -> changeSelected ---');

      descendants = root.descendants();
      for (let i = 0; i < descendants.length; i++) {
        descendants[i].data.selected = selected;
      }
    }

    // ------------------------------------------
    function checkSelected() {
      console.info('---- view_diagram -> checkSelected ---');

      let selected = false;

      descendants = root.descendants();
      for (let i = 0; i < descendants.length; i++) {
        if (descendants[i].data.selected == true) {
          selected = true;
          break;
        }
      }

      selected ? $('#button_save').removeClass('disabled') : $('#button_save').addClass('disabled');
      return selected;
    }

    // ------------------------------------------
    function clickButtonClearSelected(d) {
      console.info('---- view_diagram -> clickButtonClearSelected ---');
      changeSelected(false);
      update(root);
    }

    // ------------------------------------------
    function clickButtonSelectAll(d) {
      console.info('---- view_diagram -> clickButtonSelectAll ---');
      changeSelected(true);
      update(root);
    }

    // ------------------------------------------
    function checkNode(d) {
      console.info('---- view_diagram -> checkNode ---');
      if (!d.data.selected) { // Если не помечено, то помечаем
        // Возьмем всех родителей
        ancestors = d.ancestors(); // Текущий с родительскими
        for (let i = 0; i < ancestors.length; i++) {
          const element = ancestors[i]; // Родитель
          element.data.selected = true; // Пометим родителя
          // ПОищем непомеченное метаданное 
          if (element.data.type == 'column') {
            metadata_id = element.data.id.split('-')[0];
            child = element.children;
            if (child != undefined) {
              for (let k = 0; k < child.length; k++) {
                const child_elemet = child[k];
                if (child_elemet.data.type == 'metadata' && child_elemet.data.id == metadata_id && child_elemet.data.selected == false) {
                  child_elemet.data.selected = true;
                }
              }
            }
          }
        }
        descendants = d.descendants();
        for (let i = 0; i < descendants.length; i++) {
          const element = descendants[i]; // Дочерний
          element.data.selected = true; // Пометимдочерний элемент
        }
      } else { // Еслм помечено - снимаем пометку
        descendants = d.descendants();
        for (let i = 0; i < descendants.length; i++) {
          const element = descendants[i]; // Текущий с дочерними
          element.data.selected = false; // Снимем пометку в том числе с дочернего элемента
        }

      }
      // d.data.selected = !d.data.selected;

      // d.children = d.children ? null : d._children;
      update(d);
    }
    return svg.node();
  }

}