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
   // console.log("Connecting to appname: " + config.appname);
    var app = qlik.openApp(config.appname, config);
   // console.log("Connection has been established...");

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
      //console.log("Cube Data:");
      //console.log(qMatrix);
      // Create a new array for our extension with a row for each row in the qMatrix
      var id = 0;

      dataset = {
        "children": [
                       
          ]
      };

      var data = qMatrix.map(function (d) {
        // for each element in the matrix, create a new object that has a property
        // for the grouping dimension, the first metric, and the second metric
        //id = id + 1;

        var temp = new Object();
          temp["Name"] = d[0].qText;
          temp["side_b"] = d[1].qText;
          temp["Count"] = d[2].qNum;
          dataset.children.push(temp);

        /* return {         

          //"id": id,
          "source": d[0].qText,
          "target": d[1].qText,
          "value": d[2].qNum
        } */
      });

      //console.log(dataset);

      //console.log("Cube Data Length: " + data.length);
      //console.log(data[0]);

      bind_D3_Chart(dataset);
    }// end of the cube creation


    function bind_D3_Chart(dataset) {
     // console.log("Json Data:");
     // console.log(dataset);
      d3.selectAll("#div_D3_chart > *").remove(); 

      /*       dataset = {
              "children": [
                  {"Name":"Olives","Count":4319},
                  {"Name":"Tea","Count":4159},
                  {"Name":"Mashed Potatoes","Count":2583}
                ]
          };
      console.log(dataset); */
      var diameter = 400;
      var color = d3.scaleOrdinal(d3.schemeCategory10);

      var bubble = d3.pack(dataset)
          .size([diameter, diameter])
          .padding(1.5);

      

      var svg = d3.select("#div_D3_chart")
          .append("svg")
          .attr("width", diameter)
          .attr("height", diameter)
          .attr("class", "bubble");

      var nodes = d3.hierarchy(dataset)
          .sum(function(d) { return d.Count; });

      var node = svg.selectAll(".node")
          .data(bubble(nodes).descendants())
          .enter()
          .filter(function(d){
              return  !d.children
          })
          .append("g")
          .attr("class", "node")
          .attr("transform", function(d) {
              return "translate(" + d.x + "," + d.y + ")";
          })
          ;  

      node.on("click", function(d) {       
        app.field('side_a').selectMatch(d.data.Name, true);
      });

      node.on("mouseover", function(d) {       
        d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", (d.r * 1.2));
       
      });
      node.on("mouseout", function(d) {       
        d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", d.r);
      });

      node.append("title")
          .text(function(d) {
              return "side_a: "+ d.data.Name + "\n"+
                     "side_b: "+ d.data.side_b+"\n"+ 
                     "Incidents: "+ d.data.Count;
          });

      node.append("circle")
          .attr("r", function(d) {
              return d.r;
          })
          .style("fill", function(d,i) {
              return color(i);
          })
          .style("cursor", "hand")
          ;

      node.append("text")
          .attr("dy", ".2em")
          .style("text-anchor", "middle")
          .text(function(d) {
              return d.data.Name.substring(0, d.r / 3);
          })
          .style("cursor", "hand")
          .attr("font-family", "sans-serif")
          .attr("font-size", function(d){
              return d.r/5;
          })
          .attr("fill", "white");

      node.append("text")
          .attr("dy", "1.3em")
          .style("text-anchor", "middle")
          .text(function(d) {
              return d.data.Count;
          })
          .attr("font-family",  "Gill Sans", "Gill Sans MT")
          .attr("font-size", function(d){
              return d.r/5;
          })
          .attr("fill", "white");

      d3.select(self.frameElement)
          .style("height", diameter + "px");

      

       

    }

   
    $("#clearSelections").click(function () {
      clearAllSelections();
    });

    function clearAllSelections() {
      app.clearAll();
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
              "qLabel": "Incidents Count"
            },
            "qSortCriterias": [
              {
                "qSortByExpression": -1,
                "qExpression": {
                  "qv": "=Count({<COUNTRY={'Democratic Republic of Congo'}>}[ACLED Incident Counter])"
                },

              }
            ]
          },
          {
            "qDef": {
              "qFieldDefs": [
                "side_a"
              ],
              "qFieldLabels": [
                "side_a"
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
              ]
            }
          }         
          
        ],
        {
          "totals":{
            "show":false
          }
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