
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
        const {salesDetails,sales,payment,salesByCat}=data

        console.log(salesDetails,sales,payment,salesByCat);
  
        salesGraph(salesDetails,sales)
        paymentGraph(payment)
        categoryGraph(salesByCat)
    })


}

 // Vanilla JavaScript
 window.addEventListener("load", () => {
  findOrders("yearly");
});


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




function paymentGraph(payment) {

    let online = payment.online;
    let COD = payment.cod;
    let wallet = payment.wallet;
   

   
   

    var breakup = {
        color: "#adb5bd",
        series: [COD, online, wallet],
        labels: ["COD", "Online", "Wallet"], // Added "Wallet" to labels
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
        colors: ["#5D87FF", "#FFC107", "#FF5733"], // Added color for "Wallet"
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

    chart = new ApexCharts(document.querySelector("#breakup"), breakup);
    chart.render();
}

////////////////////////////////////////////////////////////////////////

function categoryGraph(salesByCat) {
  let MEN = salesByCat.MEN;
  let Female = salesByCat.Female;
  let Kids = salesByCat.Kids;

  var breakup = {
    color: "#adb5bd",
    series: [MEN, Female, Kids],
    labels: ["MEN", "Female", "Kids"],
    chart: {
      width: 180,
      type: "pie",
      fontFamily: "Plus Jakarta Sans', sans-serif",
      foreColor: "#adb0bb",
      sparkline: {
        enabled: true,
      },
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
    colors: ["#5D87FF", "#FFC107", "#FF5733"],
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

  // Corrected the variable name here
  chart = new ApexCharts(document.querySelector("#Category"), breakup);
  chart.render();

  //////////////////////////////////////////////////////////////////////////////

  // var breakup = {
  //   color: "#adb5bd",
  //   series: [MEN, Female, Kids],
  //   labels: ["MEN", "Female", "Kids"],
  //   chart: {
  //     width: 180,
  //     type: "donut",
  //     fontFamily: "Plus Jakarta Sans', sans-serif",
  //     foreColor: "#adb0bb",
  //     options3d: {
  //       enabled: true,
  //       alpha: 45,
  //       beta: 0,
  //     },
  //   },
  //   plotOptions: {
  //     pie: {
  //       startAngle: 0,
  //       endAngle: 360,
  //       donut: {
  //         size: '75%',
  //       },
  //     },
  //   },
  //   stroke: {
  //     show: false,
  //   },
  //   dataLabels: {
  //     enabled: false,
  //   },
  //   legend: {
  //     show: false,
  //   },
  //   colors: ["#5D87FF", "#FFC107", "#FF5733"],
  //   responsive: [
  //     {
  //       breakpoint: 991,
  //       options: {
  //         chart: {
  //           width: 150,
  //         },
  //       },
  //     },
  //   ],
  //   tooltip: {
  //     theme: "dark",
  //     fillSeriesColor: false,
  //   },
  // };

  // // Corrected the variable name here
  // chart = new ApexCharts(document.querySelector("#Category"), breakup);
  // chart.render();
}







  
  

  