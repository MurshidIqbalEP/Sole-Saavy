
let salesChart=null;

function findOrders(time){

  let timeline =time
 fetch('/admin/takeOrders?time='+ encodeURIComponent(timeline),{
  method: 'get', 
  headers: {
    'Content-Type': 'application/json'
   },
 })
 .then(response => response.json())
    .then(data => {
        const {salesDetails,sales}=data

        salesGraph(salesDetails,sales)

    })


}


  function salesGraph(salesDetails,sale){
    let orderCount = sale.orderCount;
    let label = sale.label;


     // Check if the chart instance is already created
  if (!salesChart) {
    // If not, create a new instance
    salesChart = new ApexCharts(document.querySelector("#chart"), {
      series: [{ name: "Orders ", data: orderCount }],
      chart: {
        type: "bar",
        height: 345,
        offsetX: -15,
        toolbar: { show: true },
        foreColor: "#adb0bb",
        fontFamily: "inherit",
        sparkline: { enabled: false },
      },
      colors: ["#5D87FF", "#49BEFF"],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "35%",
          borderRadius: [6],
          borderRadiusApplication: 'end',
          borderRadiusWhenStacked: 'all'
        },
      },
      markers: { size: 0 },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      grid: {
        borderColor: "rgba(0,0,0,0.1)",
        strokeDashArray: 3,
        xaxis: {
          lines: {
            show: false,
          },
        },
      },
      xaxis: {
        type: "category",
        categories: label,
        labels: {
          style: { cssClass: "grey--text lighten-2--text fill-color" },
        },
      },
      yaxis: {
        show: true,
        min: 0,
        max: Math.max(...orderCount) + 2, // Adjust the max value based on your data
        tickAmount: 4,
        labels: {
          style: {
            cssClass: "grey--text lighten-2--text fill-color",
          },
        },
      },
      stroke: {
        show: true,
        width: 3,
        lineCap: "butt",
        colors: ["transparent"],
      },
      tooltip: { theme: "light" },
      responsive: [
        {
          breakpoint: 600,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 3,
              }
            },
          }
        }
      ]
    });

    // Render the chart
    salesChart.render();
  } else{
    // If the chart instance already exists, update its configuration and data
    salesChart.updateOptions({
      xaxis: {
        categories: label,
      },
      yaxis: {
        max: Math.max(...orderCount) + 2,
      },
    });

    salesChart.updateSeries([{ data: orderCount }]);
  }

}

  //   series: [
  //     { name: "Earnings this month:", data: [100, 200, 300, 350, 390, 180, 1000, 390] },
     
  //   ],

  //   chart: {
  //     type: "bar",
  //     height: 345,
  //     offsetX: -15,
  //     toolbar: { show: true },
  //     foreColor: "#adb0bb",
  //     fontFamily: 'inherit',
  //     sparkline: { enabled: false },
  //   },


  //   colors: ["#5D87FF", "#49BEFF"],


  //   plotOptions: {
  //     bar: {
  //       horizontal: false,
  //       columnWidth: "35%",
  //       borderRadius: [6],
  //       borderRadiusApplication: 'end',
  //       borderRadiusWhenStacked: 'all'
  //     },
  //   },
  //   markers: { size: 0 },

  //   dataLabels: {
  //     enabled: false,
  //   },


  //   legend: {
  //     show: false,
  //   },


  //   grid: {
  //     borderColor: "rgba(0,0,0,0.1)",
  //     strokeDashArray: 3,
  //     xaxis: {
  //       lines: {
  //         show: false,
  //       },
  //     },
  //   },

  //   xaxis: {
  //     type: "category",
  //     categories: ["2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007"],
  //     labels: {
  //       style: { cssClass: "grey--text lighten-2--text fill-color" },
  //     },
  //   },


  //   yaxis: {
  //     show: true,
  //     min: 0,
  //     max: 1000,
  //     tickAmount: 4,
  //     labels: {
  //       style: {
  //         cssClass: "grey--text lighten-2--text fill-color",
  //       },
  //     },
  //   },
  //   stroke: {
  //     show: true,
  //     width: 3,
  //     lineCap: "butt",
  //     colors: ["transparent"],
  //   },


  //   tooltip: { theme: "light" },

  //   responsive: [
  //     {
  //       breakpoint: 600,
  //       options: {
  //         plotOptions: {
  //           bar: {
  //             borderRadius: 3,
  //           }
  //         },
  //       }
  //     }
  //   ]


  // };

  // var chart = new ApexCharts(document.querySelector("#chart"), chart);
  // chart.render();


  // =====================================
  // Breakup
  // =====================================
  var breakup = {
    color: "#adb5bd",
    series: [38, 40, 25],
    labels: ["2022", "2021", "2020"],
    chart: {
      width: 180,
      type: "donut",
      fontFamily: "Plus Jakarta Sans', sans-serif",
      foreColor: "#adb0bb",
    },
    plotOptions: {
      pie: {
        startAngle: 0,
        endAngle: 360,
        donut: {
          size: '75%',
        },
      },
    },
    stroke: {
      show: false,
    },

    dataLabels: {
      enabled: false,
    },

    legend: {
      show: false,
    },
    colors: ["#5D87FF", "#ecf2ff", "#F9F9FD"],

    responsive: [
      {
        breakpoint: 991,
        options: {
          chart: {
            width: 150,
          },
        },
      },
    ],
    tooltip: {
      theme: "dark",
      fillSeriesColor: false,
    },
  };

  var chart = new ApexCharts(document.querySelector("#breakup"), breakup);
  chart.render();



  // =====================================
  // Earning
  // =====================================
  var earning = {
    chart: {
      id: "sparkline3",
      type: "area",
      height: 60,
      sparkline: {
        enabled: true,
      },
      group: "sparklines",
      fontFamily: "Plus Jakarta Sans', sans-serif",
      foreColor: "#adb0bb",
    },
    series: [
      {
        name: "Earnings",
        color: "#49BEFF",
        data: [25, 66, 20, 40, 12, 58, 20],
      },
    ],
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      colors: ["#f3feff"],
      type: "solid",
      opacity: 0.05,
    },

    markers: {
      size: 0,
    },
    tooltip: {
      theme: "dark",
      fixed: {
        enabled: true,
        position: "right",
      },
      x: {
        show: false,
      },
    },
  };
  new ApexCharts(document.querySelector("#earning"), earning).render();
