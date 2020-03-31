
var sensorChartCh1;
var sensorChartCh2;
var sensorChartCh3;


class VoltAmpChart {
    constructor(outputElement, channelNumber) {

        this.chart = new Chart(document.getElementById(outputElement).getContext('2d'), {
            type: 'line',
            data: getDataSetup(),
            options: getChartOptions(channelNumber)
        });

    }


    addData(sensorEvent) {
        // append the new data to the existing chart data
        let currentTime = Date.now();
        this.chart.config.data.datasets[0].data.push({
            x: currentTime,
            y: sensorEvent.busvoltage
        });
    
        // append the new data to the existing chart data
        this.chart.config.data.datasets[1].data.push({
            x: currentTime,
            y: sensorEvent.shuntvoltage_mV
        });
    
        // append the new data to the existing chart data
        this.chart.config.data.datasets[2].data.push({
            x: currentTime,
            y: sensorEvent.loadvoltage
        });
    
        // append the new data to the existing chart data
        this.chart.config.data.datasets[3].data.push({
            x: currentTime,
            y: (sensorEvent.current_mA >= 0 ? sensorEvent.current_mA : (sensorEvent.current_mA * -1))
        });
    
        // update chart datasets keeping the current animation
        this.chart.update({
            preservation: true
        });
    }


}

let ch1
let ch2
let ch3

function calculateMilliAmpHours(sensorEvent) {
    let ch1_mA = (sensorEvent.ch1.current_mA >= 0 ? sensorEvent.ch1.current_mA : (sensorEvent.ch1.current_mA * -1))
    let ch2_mA = (sensorEvent.ch2.current_mA >= 0 ? sensorEvent.ch2.current_mA : (sensorEvent.ch2.current_mA * -1))
    let ch3_mA = (sensorEvent.ch3.current_mA >= 0 ? sensorEvent.ch3.current_mA : (sensorEvent.ch3.current_mA * -1))

    ch1.consume(ch1_mA);
    ch2.consume(ch2_mA);
    ch3.consume(ch3_mA);
    
    document.getElementById("ch1mAh").innerHTML = ch1.avgConsumption+ " Events per second:" + ch1.eventsPerSecond;
    document.getElementById("ch2mAh").innerHTML = ch2.avgConsumption+ " Events per second:" + ch2.eventsPerSecond;
    document.getElementById("ch3mAh").innerHTML = ch3.avgConsumption+ " Events per second:" + ch3.eventsPerSecond;

}

class Channel {

    constructor() {
        this.mAhEstimated = 0;
        this.mAhEstimated = 0;
        this.timestampFirstEvent = null;
        this.agregatedCurrentConsumption = 0;
        this.avgCurrentConsumption = 0
        this.numberOfEvents = 0;
        this.timeSpentMetering = 0;
    }


    consume(milliAmpere) {
        if (this.timestampFirstEvent === null) {
            this.timestampFirstEvent = Date.now()
        }
        this.numberOfEvents++

        this.timeSpentMetering = (Date.now() - this.timestampFirstEvent) / 1000;

        this.agregatedCurrentConsumption += parseInt(milliAmpere);

        this.avgCurrentConsumption = this.agregatedCurrentConsumption / this.numberOfEvents
    }

    get avgConsumption() {
        return this.avgCurrentConsumption;
    }

    get eventsPerSecond(){
        return (this.numberOfEvents / this.timeSpentMetering)
    }
}

function getDataSetup() {
    return {
        datasets: [{
            data: [],
            yAxisID: 'y-axis-V',
            label: "Bus V",
            borderColor: "rgba(150,0,0,1)",
            fill: false
        },
        {
            data: [],
            label: "Shunt mV",
            yAxisID: 'y-axis-V',
            borderColor: "rgba(180,180,180,1)",
            fill: false,
            hidden: true
        },
        {
            data: [],
            label: "Load V",
            yAxisID: 'y-axis-V',
            borderColor: "rgba(150,0,0,0.3)",
            fill: false,
            hidden: true
        },
        {
            data: [],
            label: "Current mA",
            yAxisID: 'y-axis-A',
            borderColor: "rgba(0,150,0,1)",
            fill: false
        }
        ]
    }
}

function getChartOptions(chanelnumber) {
    return {
        title: {
            display: true,
            text: 'Stats for channel ' + chanelnumber
        },
        scales: {
            xAxes: [{
                type: 'realtime',
                realtime: {
                    duration: 60000,
                    delay: 500,
                }
            }],
            yAxes: [{
                type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                display: true,
                position: 'left',
                id: 'y-axis-V',
                scaleLabel: {
                    display: true,
                    labelString: 'Voltage'
                },
            }, {
                type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                display: true,
                position: 'right',
                id: 'y-axis-A',
                scaleLabel: {
                    display: true,
                    labelString: 'milliAmps'
                },
                gridLines: { // grid line settings
                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                }
            }]
        },
        tooltips: {
            mode: 'nearest',
            intersect: false
        },
        hover: {
            mode: 'nearest',
            intersect: false
        }

    }

}



