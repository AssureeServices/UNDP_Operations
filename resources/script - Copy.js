// Input your config 
var config = {
  host: "playground.qlik.com",
  prefix: "/playground/",
  port: "443",
  isSecure: true,
  rejectUnauthorized: false,
  apiKey: "zt9IostGFBFLhTifncpp9ju609xb1mUA",
  appname: "6f263378-12ed-4e25-bd95-b5a051229bad"
};

function authenticate() {
  Playground.authenticate(config);
};


function main() {

  require.config({
    baseUrl: (config.isSecure ? "https://" : "http://") + config.host + (config.port ? ":" + config.port : "") + config.prefix + "resources"
  });

  /**
   * Load the entry point for the Capabilities API family
   * See full documention: http://help.qlik.com/en-US/sense-developer/Subsystems/APIs/Content/MashupAPI/qlik-interface-interface.htm
   */

  require(['js/qlik'], function (qlik) {
    // We're now connected

    /* // Suppress Qlik error dialogs and handle errors how you like.
    qlik.setOnError(function (error) {
      console.log(error);
    }); */

    // Open a dataset on the server.  
    console.log("Connecting to appname: " + config.appname);
    var app = qlik.openApp(config.appname, config);
    console.log("Connection has been established...");

    //create cubes and lists -- inserted here --
    app.createCube({
      "qInitialDataFetch": [
        {
          "qHeight": 1000,
          "qWidth": 4
        }
      ],
      "qDimensions": [
        {
          "qDef": {
            "qFieldDefs": [
              "side_a"
            ]
          },
          "qNullSuppression": true,
          "qOtherTotalSpec": {
            "qOtherMode": "OTHER_OFF",
            "qSuppressOther": true,
            "qOtherSortMode": "OTHER_SORT_DESCENDING",
            "qOtherCounted": {
              "qv": "5"
            },
            "qOtherLimitMode": "OTHER_GE_LIMIT"
          }
        },
        {
          "qDef": {
            "qFieldDefs": [
              "side_b"
            ]
          },
          "qNullSuppression": true,
          "qOtherTotalSpec": {
            "qOtherMode": "OTHER_OFF",
            "qSuppressOther": true,
            "qOtherSortMode": "OTHER_SORT_DESCENDING",
            "qOtherCounted": {
              "qv": "5"
            },
            "qOtherLimitMode": "OTHER_GE_LIMIT"
          }
        }
      ],
      "qMeasures": [
        {
          "qDef": {
            "qDef": "=Count({<COUNTRY={'Democratic Republic of Congo'}>}[ACLED Incident Counter])"
          },
          "qLabel": "Count([ACLED Incident Counter])",
          "qLibraryId": null,
          "qSortBy": {
            "qSortByState": 0,
            "qSortByFrequency": 0,
            "qSortByNumeric": 0,
            "qSortByAscii": 1,
            "qSortByLoadOrder": 0,
            "qSortByExpression": 0,
            "qExpression": {
              "qv": " "
            }
          }
        }
      ],
      "qSuppressZero": false,
      "qSuppressMissing": false,
      "qMode": "S",
      "qInterColumnSortOrder": [],
      "qStateName": "$"
    }, testFunction);

    function testFunction(reply, app) {

      // console.log(reply.qHyperCube.qDataPages[0].qMatrix);

      var qMatrix = reply.qHyperCube.qDataPages[0].qMatrix;

      // Create a new array for our extension with a row for each row in the qMatrix
      var id = 0;
      var data = qMatrix.map(function (d) {
        // for each element in the matrix, create a new object that has a property
        // for the grouping dimension, the first metric, and the second metric
        id = id + 1;
        return {
          //"id": id,
          "source": d[0].qText,
          "target": d[1].qText,
          "value": d[2].qNum
        }
      });

      console.log("Cube Data Length: " + data.length);
      console.log(data[0]);

      bind_D3_Chart(data);
    }// end of the cube creation


    function bind_D3_Chart(data) {
    console.log(data);

    

      /*  data = d3.nest()
        .key(function(d) { return d.target;})
        .rollup(function(d) { 
        return d3.sum(d, function(g) {return g.value; });
        }).entries(data); */
       
    

     // let margin = {top: 20, right: 100, bottom: 100, left: 20};

      var width = 500,
          height = 600,
          padding = 1.5, // separation between same-color circles
          clusterPadding = 20, // separation between different-color circles
          maxRadius = 50;
      
      let n = 200, // total number of nodes
          m = 10, // number of distinct clusters
          z = d3.scaleOrdinal(d3.schemeCategory10),
          clusters = new Array(m);

      var categorical = [
            { "id":0 ,"name" : "schemeAccent", "n": 8},
            { "id":1 ,"name" : "schemeDark2", "n": 8},
            { "id":2 ,"name" : "schemePastel2", "n": 8},
            { "id":3 ,"name" : "schemeSet2", "n": 8},
            { "id":4 ,"name" : "schemeSet1", "n": 9},
            { "id":5 ,"name" : "schemePastel1", "n": 9},
            { "id":6 ,"name" : "schemeCategory10", "n" : 10},
            { "id":7 ,"name" : "schemeSet3", "n" : 12 },
            { "id":8 ,"name" : "schemePaired", "n": 12},
            { "id":9 ,"name" : "schemeCategory20", "n" : 20 },
            { "id":10 ,"name" : "schemeCategory20b", "n" : 20},
            { "id":11 ,"name" : "schemeCategory20c", "n" : 20 }
          ]    
      var colorScale = d3.scaleOrdinal(d3[categorical[9].name])

      d3.selectAll("#div_D3_chart > *").remove(); 

      let svg = d3.select('#div_D3_chart')
          .append('svg')
          .attr('height', height)
          .attr('width', width)
          .style('padding-top', "50px")

          .append('g').attr('transform', 'translate(' + width/2.6 + ',' + height / 4 + ')');
          
           /* Create the text for each block */
    
      
      // Define the div for the tooltip
      let div = d3.select("body").append("div") 
      .attr("class", "tooltip")       
      .style("opacity", 0);
      

    //  d3.csv("college-majors.csv", function(d){
        let radiusScale = d3.scalePow()
          .domain(d3.extent(data, function(d) { return +d.value;} ))
          .range([2, maxRadius]);
      
     // console.log(radiusScale(300000));
     let nodes;
     
      nodes = data.map((d) => {
        // scale radius to fit on the screen
        let scaledRadius  = radiusScale(+d.value),
            forcedCluster = +d.target;
    
        // add cluster id and radius to array
        d = {
          cluster     : forcedCluster,
          r           : scaledRadius,
          source      : d.source,
          target      : d.target,
          value       : d.value
        };
        // add to clusters array if it doesn't exist or the radius is larger than another radius in the cluster
        if (!clusters[forcedCluster] || (scaledRadius > clusters[forcedCluster].r)) clusters[forcedCluster] = d;
    
        return d;
      });
     /*  data = d3.nest()
      .key(function(d) { return d.target;})
      .rollup(function(d) { 
      return d3.sum(d, function(g) {return g.value; });
      }).entries(data); */
     console.log(nodes);
        // append the circles to svg then style
        // add functions for interaction
        var circles = svg.append('g')
              .datum(nodes)
              .selectAll('.circle')
              .data(d => d)

             

            .enter().append('circle')
              .attr('r', (d) => d.r)
              //.attr('fill', (d) => z(d.cluster))
              .style("fill", function(d, i) { return colorScale(i); })
              .attr('stroke', 'black')
              .attr('stroke-width', 1)
             
            
              
              .call(d3.drag()
                  .on("start", dragstarted)
                  .on("drag", dragged)
                  .on("end", dragended))

              // add tooltips to each circle
              .on("mouseover", function(d) {
                div.transition()    
                    .duration(200)    
                    .style("opacity", .9);    
                div .html(                  
                  checkValue(d.source)+
                   "side_b: " +  d.target+ "<br/>"+
                   "Incident Count: " + d.value 
                  )  
                    .style("left", (d3.event.pageX) + "px")   
                    .style("top", (d3.event.pageY - 28) + "px");  
                })          
                .on("mouseout", function(d) {   
                    div.transition()    
                        .duration(500)    
                        .style("opacity", 0); 
                })
            ;


           var a=nodes.append("text")
           .attr("dy", ".3em")
           .style("text-anchor", "middle")
           .text(function(d) { return d.source.substring(0, d.r / 3); });





            function checkValue(a)
            {
              if(a.length > 0)
              {
               return "side_a: " +  a + "<br/>";
              }
              else
              {
                return "";
              }
            }
        // create the clustering/collision force simulation
        let simulation = d3.forceSimulation(nodes)
            .velocityDecay(0.1)
            .force("x", d3.forceX().strength(.0005))
            .force("y", d3.forceY().strength(.0005))
            .force("collide", collide)
            .force("cluster", clustering)
            .on("tick", ticked);
      
        function ticked() {
            circles
                .attr('cx', (d) => d.x)
                .attr('cy', (d) => d.y);
        }
      
        // Drag functions used for interactivity
        function dragstarted(d) {
          if (!d3.event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }
      
        function dragged(d) {
          d.fx = d3.event.x;
          d.fy = d3.event.y;
        }
      
        function dragended(d) {
          if (!d3.event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }
      
        // These are implementations of the custom forces.
        function clustering(alpha) {
            nodes.forEach(function(d) {
              var cluster = clusters[d.cluster];
              if (cluster === d) return;
              var x = d.x - cluster.x,
                  y = d.y - cluster.y,
                  l = Math.sqrt(x * x + y * y),
                  r = d.r + cluster.r;
              if (l !== r) {
                l = (l - r) / l * alpha;
                d.x -= x *= l;
                d.y -= y *= l;
                cluster.x += x;
                cluster.y += y;
              }
            });
        }
      
        function collide(alpha) {
          var quadtree = d3.quadtree()
              .x((d) => d.x)
              .y((d) => d.y)
              .addAll(nodes);
      
          nodes.forEach(function(d) {
            var r = d.r + maxRadius + Math.max(padding, clusterPadding),
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function(quad, x1, y1, x2, y2) {
      
              if (quad.data && (quad.data !== d)) {
                var x = d.x - quad.data.x,
                    y = d.y - quad.data.y,
                    l = Math.sqrt(x * x + y * y),
                    r = d.r + quad.data.r + (d.cluster === quad.data.cluster ? padding : clusterPadding);
                if (l < r) {
                  l = (l - r) / l * alpha;
                  d.x -= x *= l;
                  d.y -= y *= l;
                  quad.data.x += x;
                  quad.data.y += y;
                }
              }
              return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
          });
        }
      
      
     // });

    }

    /* var myField = app.field("Energy Star Score").getData();

    
    myField.rows.forEach(function (row) {
    }); */


    /*  var myField = app.field("Energy Star Score").getData();
     myField.OnData.bind(function () {
       myField.rows.forEach(function (row) {
         //alert(row.qText);
         //console.log(row.qText);
         if ($("#my_Listbox1 option[value='" + row.qText + "']").length == 0) {
           $('#my_Listbox1').append($('<option>', {
             value: row.qText,
             text: row.qText
           }));
         }
       });
       var sel_Value = $("#my_Listbox1").val();
       if (sel_Value == "0" || sel_Value == "clear_all") {
         app.field('Energy Star Score').clear();
       }
 
     });
 
     $("#my_Listbox1").change(function () {
       var sel_Value = $("#my_Listbox1").val();
       if (sel_Value == "0" || sel_Value == "clear_all") {
         app.field('Energy Star Score').clear();
       }
       else if (sel_Value == "select_all") {
         app.field('Energy Star Score').selectAll();
       }
 
       else {
         app.field('Energy Star Score').clear();
         app.field('Energy Star Score').selectMatch(sel_Value, true, true);
       }
       //bind_Chart();
     });
 
     var myField1 = app.field("BERDOYear").getData();
     myField1.OnData.bind(function () {
       myField1.rows.forEach(function (row) {
         //alert(row.qText);
         //console.log(row.qText);
         if ($("#my_Listbox2 option[value='" + row.qText + "']").length == 0) {
           $('#my_Listbox2').append($('<option>', {
             value: row.qText,
             text: row.qText
           }));
         }
       });
       var sel_Value = $("#my_Listbox2").val();
       if (sel_Value == "0" || sel_Value == "clear_all") {
         app.field('BERDOYear').clear();
       }
 
     });
 
     $("#my_Listbox2").change(function () {
       var sel_Value = $("#my_Listbox2").val();
       if (sel_Value == "0" || sel_Value == "clear_all") {
         app.field('BERDOYear').clear();
       }
       else if (sel_Value == "select_all") {
         app.field('BERDOYear').selectAll();
       }
 
       else {
         app.field('BERDOYear').clear();
         app.field('BERDOYear').selectMatch(sel_Value, true, true);
       }
       //bind_Chart();
     }); */

    // 

    $("#clearSelections").click(function () {
      clearAllSelections();
    });

    function clearAllSelections() {
      app.clearAll();
      // $("#my_Listbox1").val(0);
      //$("#my_Listbox2").val(0);

    }




    function getSelectionList() {
      app.getList("SelectionObject", function (reply) {

        $selections = $("#selections");  //DOM node to append selections to
        $selections.html("");  //Clear node of any previous selections

        $clearAll = $("#clear_all");
        $clearAll.html("<span class='noneText'> None </span>");



        //Loop through array of fields that have selections
        $.each(reply.qSelectionObject.qSelections, function (key, value) {

          // console.log(value);

          var field = value.qReadableName;  //The field name
          var numSelected = value.qSelectedCount;  //Number of selections in field
          var total = value.qTotal;  //Total number of values in field
          var threshold = value.qSelectionThreshold;  //Threshold in which to display a number count instead of each value
          var selectedStr = value.qSelected;  //When numSelected is less than or equal to threshold, a string of the names of each value selected




          if (field == undefined) {
            field = value.qField;

          }


          //If numSelected is below or equal to threshold, show string of names of each value selected
          if (numSelected <= 2) {



            var html = "";
            html += "<span class='selected-field-container' id='" + field + "' style='padding-right:10px;'> ";
            html += "<span class='selected-field'>" + field + ": </span>";
            html += "<span class='selected-field-value'>" + selectedStr + " </span>";
            html += " <span class='clear-field' style='cursor:pointer;'><img src='cross-button.png' height='10px' width='10px' alt='Clear'/></span>";
            html += "</span>";
            $selections.append(html);
          }

          // If numSelected is greater than threshold, show the numSelected of total values
          else {
            var html = "";
            html += "<span class='selected-field-container' id='" + field + "'style='padding-right:10px;'>";
            html += "<span class='selected-field'>" + field + ": </span>";
            html += "<span class='selected-field-value'>" + numSelected + " of " + total + " </span>";
            html += " <span class='clear-field' style='cursor:pointer;'><img src='cross-button.png'  height='10px' width='10px' alt='Clear'/></span>";
            html += "</span>";
            $selections.append(html);
          }

          if (selectedStr) {
            $clearAll.html("<span class='clear-all' > Clear All </span>");
          }
          else {
            $clearAll.html("<span class='noneText'> None </span>");
          }

        });

        //Event listener on .clear-field to clear that field's selections when clicked
        $(".clear-field").click(function () {
          //console.log($(this).parent().attr("id"));
          var field = $(this).parent().attr("id");
          app.field(field).clear();
        });

        $(".clear-all").click(function () {
          clearAllSelections();
        });
      });
    }

    function bind_Chart() {

      app.visualization.create(
        'table',
        [
          {
            "qDef": {
              "qDef": "=Count({<COUNTRY={'Democratic Republic of Congo'}>}[ACLED Incident Counter])",
              "qLabel": "Incidents"
            }
          },
          {
            "qDef": {
              "qFieldDefs": [
                "side_a"
              ],
              "qFieldLabels": [
                "side_a"
              ],
              "qSortCriterias": [
                {
                  "qSortByExpression": -1,
                  "qExpression": {
                    "qv": "=Count({<COUNTRY={'Democratic Republic of Congo'}>}[ACLED Incident Counter])"
                  },

                }
              ]
            }
          },
          {
            "qDef": {
              "qFieldDefs": [
                "side_b"
              ],
              "qFieldLabels": [
                "side_b"
              ],
              "qSortCriterias": [
                {
                  "qSortByExpression": -1,
                  "qExpression": {
                    "qv": "=Count({<COUNTRY={'Democratic Republic of Congo'}>}[ACLED Incident Counter])"
                  },

                }
              ]
            }
          }         

        ],
        {
          //"showTitles": true,
          //"title": "Primary Actors Involved in Incidents took place in DRC",
          //"subtitle": "My subtitle",
          //"footnote": "This chart will show the sum of GHG Intensity for all the property by property type.",
          //"orientation": "vertical",
          //"scrollStartPos": "1",
          /* "gridLine": {
            "auto": false,
            "spacing": 300
          },
          "dataPoint": {
            "showLabels": false
          },
            "color": {
             "auto": false,
             "mode": "byMeasure",
             "measureScheme": "sc"
           }  */
        }
      ).then(function (vis) {
        vis.show("div_D3_chart_table");
      });

      /* KPI Area */

      app.visualization.create(
        'kpi',
        [
          {
            "qDef": {
              "qLabel": "Countries (Including DRC)",
              "qDef": "Count(DISTINCT COUNTRY)"

            }
          }
        ],
        {
          "showTitles": false,
          "showMeasureTitle": true,
          "textAlign": "center",
          "fontSize": "L"
        }
      ).then(function (vis) {
        vis.show("kpi1");
      });

      app.visualization.create(
        'kpi',
        [
          {
            "qDef": {
              "qLabel": "Incidents in DRC",
              "qDef": "Count({<COUNTRY={'Democratic Republic of Congo'}>}[ACLED Incident Counter])"
            }
          }
        ],
        {
          "showTitles": false,
          "showMeasureTitle": true,
          "textAlign": "center",
          "fontSize": "L"
        }
      ).then(function (vis) {
        vis.show("kpi2");
      });


      app.visualization.create(
        'kpi',
        [
          {
            "qDef": {
              "qLabel": "Incidents in Other Countries",
              "qDef": "Count({<COUNTRY-={'Democratic Republic of Congo'}>}[ACLED Incident Counter])"

            }
          }
        ],
        {
          "showTitles": false,
          "showMeasureTitle": true,
          "textAlign": "center",
          "fontSize": "L"
        }
      ).then(function (vis) {
        vis.show("kpi3");
      });

      app.visualization.create(
        'kpi',
        [
          {
            "qDef": {
              "qLabel": "Primary Actor",
              "qDef": "Count(DISTINCT ACTOR1)"

            }
          }
        ],
        {
          "showTitles": false,
          "showMeasureTitle": true,
          "textAlign": "center",
          "fontSize": "L"
        }
      ).then(function (vis) {
        vis.show("kpi4");
      });
	  
	   app.visualization.create(
        'kpi',
        [
          {
            "qDef": {
              "qLabel": "Secondary Actor",
              "qDef": "Count(DISTINCT ACTOR2)"

            }
          }
        ],
        {
          "showTitles": false,
          "showMeasureTitle": true,
          "textAlign": "center",
          "fontSize": "L"
        }
      ).then(function (vis) {
        vis.show("kpi5");
      });

	   app.visualization.create(
        'kpi',
        [
          {
            "qDef": {
              "qLabel": "Fatalities",
              "qDef": "Sum(FATALITIES)"

            }
          }
        ],
        {
          "showTitles": false,
          "showMeasureTitle": true,
          "textAlign": "center",
          "fontSize": "L"
        }
      ).then(function (vis) {
        vis.show("kpi6");
      });

      app.visualization.create(
        'kpi',
        [
          {
            "qDef": {
              "qLabel": "ALLY ACTOR 1",
              "qDef": "Count(distinct ALLY_ACTOR_1)"

            }
          }
        ],
        {
          "showTitles": false,
          "showMeasureTitle": true,
          "textAlign": "center",
          "fontSize": "L"
        }
      ).then(function (vis) {
        vis.show("kpi7");
      });

      app.visualization.create(
        'kpi',
        [
          {
            "qDef": {
              "qLabel": "ALLY ACTOR 2",
              "qDef": "Count(distinct ALLY_ACTOR_2)"

            }
          }
        ],
        {
          "showTitles": false,
          "showMeasureTitle": true,
          "textAlign": "center",
          "fontSize": "L"
        }
      ).then(function (vis) {
        vis.show("kpi8");
      });


      /* Barchart Area */

      app.visualization.create(
        'barchart',
        [
          {
            "qDef": {
              "qFieldDefs": [
                "ACTOR1"
              ],
              "qFieldLabels": [
                "Actor1"
              ],
              "qSortCriterias": [
                {
                  "qSortByExpression": -1,
                  "qExpression": {
                    "qv": "=Count({<COUNTRY={'Democratic Republic of Congo'}>}[ACLED Incident Counter])"
                  },

                }
              ]
            }
          },
          {
            "qDef": {
              "qDef": "=Count({<COUNTRY={'Democratic Republic of Congo'}>}[ACLED Incident Counter])",
              "qLabel": "Incidents"
            }
          }

        ],
        {
          "showTitles": true,
          "title": "Primary Actors Involved in Incidents took place in DRC",
          //"subtitle": "My subtitle",
          //"footnote": "This chart will show the sum of GHG Intensity for all the property by property type.",
          "orientation": "horizontal",
          "scrollStartPos": "0",
          "gridLine": {
            "auto": false,
            "spacing": 500
          },
          "dataPoint": {
            "showLabels": true
          },
          /*  "color": {
             "auto": false,
             "mode": "byMeasure",
             "measureScheme": "sc"
           } */
        }
      ).then(function (vis) {
        vis.show("chart1");
      });

      app.visualization.create(
        'barchart',
        [
          {
            "qDef": {
              "qFieldDefs": [
                "ACTOR2"
              ],
              "qFieldLabels": [
                "Actor2"
              ],
              "qSortCriterias": [
                {
                  "qSortByExpression": -1,
                  "qExpression": {
                    "qv": "=Count({<COUNTRY={'Democratic Republic of Congo'}>}[ACLED Incident Counter])"
                  },

                }
              ]
            }
          },
          {
            "qDef": {
              "qDef": "=Count({<COUNTRY={'Democratic Republic of Congo'}>}[ACLED Incident Counter])",
              "qLabel": "Incidents"
            }
          }

        ],
        {
          "showTitles": true,
          "title": "Secondary Actors Involved in Incidents took place in DRC",
          //"subtitle": "My subtitle",
          //"footnote": "This chart will show the sum of GHG Intensity for all the property by property type.",
          "orientation": "horizontal",
          "scrollStartPos": "0",
          "gridLine": {
            "auto": false,
            "spacing": 500
          },
          "dataPoint": {
            "showLabels": true
          },
          /*  "color": {
             "auto": false,
             "mode": "byMeasure",
             "measureScheme": "sc"
           } */
        }
      ).then(function (vis) {
        vis.show("chart2");
      });


      app.visualization.create(
        'linechart',
        [
          {
            "qDef": {
              "qFieldDefs": [
                "[EVENT_DATE]"
              ],
              "qFieldLabels": [
                "EVENT DATE"
              ],
              "qSortCriterias": [
                {
                  "qSortByExpression": -1,
                  "qExpression": {
                    "qv": "Sum([ACLED Incident Counter])"
                  },

                }
              ]
            }
          },
          {
            "qDef": {
              "qDef": "Sum([ACLED Incident Counter])",
              "qLabel": "ACLED Incident Counter"
            }
          },
          {
            "qDef": {
              "qDef": "Sum(FATALITIES)",
              "qLabel": "FATALITIES"
            }
          }


        ],
        {
          "showTitles": true,
          "title": "Death due to Conflicts",
          //"subtitle": "My subtitle",
          //"footnote": "This chart will show the sum of GHG Intensity for all the property by property type.",
          "orientation": "vertical",
          "scrollStartPos": "0",
          "gridLine": {
            "auto": false,
            "spacing": 500
          },
          "dataPoint": {
            "showLabels": true
          },
          /*  "color": {
             "auto": false,
             "mode": "byMeasure",
             "measureScheme": "sc"
           } */
        }
      ).then(function (vis) {
        vis.show("chart3");
      });


      app.visualization.create(
        'treemap',
        [
          {
            "qDef": {
              "qFieldDefs": [
                "ACTOR1"
              ],
              "qFieldLabels": [
                "ACTOR1"
              ]
            },
            "qNullSuppression": true
          },
          {
            "qDef": {
              "qFieldDefs": [
                "ALLY_ACTOR_1"
              ]
            },
            "qNullSuppression": true
          },
          {
            "qDef": {
              "qLabel": "Incidents",
              "qDef": "Count([ACLED Incident Counter])"
            }
          }
        ],
        {
          "showTitles": true,
          "title": "Actor 1"
        }
      ).then(function (vis) {
        vis.show("chart4");
      });

      app.visualization.create(
        'treemap',
        [
          {
            "qDef": {
              "qFieldDefs": [
                "ACTOR2"
              ],
              "qFieldLabels": [
                "ACTOR2"
              ]
            },
            "qNullSuppression": true
          },
          {
            "qDef": {
              "qFieldDefs": [
                "ALLY_ACTOR_2"
              ]
            },
            "qNullSuppression": true
          },
          {
            "qDef": {
              "qLabel": "Incidents",
              "qDef": "Count([ACLED Incident Counter])"
            }
          }
        ],
        {
          "showTitles": true,
          "title": "Actor 2"
        }
      ).then(function (vis) {
        vis.show("chart5");
      });




    }

    getSelectionList();
    bind_Chart();



    //console.log("End of the code...");
  });
};