const { Sorter } = require('../Sorter');
const { Printer } = require('../../printer/Printer');

function newArray(largo) {
    let sortTest = [];
    let limit = (largo < 10000000) ? largo : 10000000
    let k = 0;
    while (k < largo) {
        sortTest.push(Math.floor(Math.random()*limit));
        k++;
    }
    // console.log('Array Done!');
    return sortTest;
}

function testTime(f, min = 10, maxTime = 60000, samples = 1, step = () => {return min *= 10;}) {
    let arr, t, ts, k, tiempos;

    if (typeof f !== 'function') { return; }

    t = 0;
    k = 0;
    tiempos = [];
    while (t < maxTime && k < 10000000) {
        if (k >= min) {
            k = step();
        } else {
            k = min;
        }
        // console.log(k);
        arr = newArray(k);
        ts = [];
        for (let j = 0; j < samples; j++) {
            t = Date.now();
            f(arr);
            ts.push(Date.now() - t);
        }
        t = 0;
        ts.forEach((tv) => {
            t += tv;
        });
        t = Math.ceil(t/samples)
        tiempos.push(t);
        // console.log('Time: ' + t + ' ms');
    }
    if (k >= 10000000) {
        console.log('Limit reached!');
    }

    return tiempos;
}

function test () {
    let funciones = [
        {
            f: (val) => { Sorter.insertionSort(val) },
            t: [],
            n: 'insertion'
        },
        {
            f: (val) => { Sorter.selectionSort(val) },
            t: [],
            n: 'selection'
        },
        {
            f: (val) => { Sorter.quickSort(val) },
            t: [],
            n: 'quick'
        },
        {
            f: (val) => { Sorter.mergeSort(val) },
            t: [],
            n: 'merge'
        },
        {
            f: (val) => { Sorter.heapSort(val) },
            t: [],
            n: 'heap'
        },
        {
            f: (val) => { Sorter.radixLSDSort(val) },
            t: [],
            n: 'radixLSD'
        },
        {
            f: (val) => { Sorter.radixMSDSort(val) },
            t: [],
            n: 'radixMSD'
        },
        {
            f: (val) => { Sorter.shellSort(val) },
            t: [],
            n: 'shell'
        },
        {
            f: (val) => { Sorter.bubbleSort(val) },
            t: [],
            n: 'bubble'
        },
        {
            f: (val) => { Sorter.cocktailShakerSort(val) },
            t: [],
            n: 'cocktailShaker'
        },
        {
            f: (val) => { Sorter.gnomeSort(val) },
            t: [],
            n: 'gnome'
        }
    ];

    funciones.forEach((f) => {
        console.log(f.n);
        f.t = testTime((arr) => {
            f.f(arr);
        }, 10, 1000, 1);
    });

    funciones.sort((a, b) => {
        let aMax = a.t[a.t.length - 1];
        let bMax = b.t[b.t.length - 1];

        if (aMax > bMax) {
            return 1;
        } else if (aMax < bMax) {
            return -1;
        } else {
            return 0;
        }
    }).sort((a, b) => {
        let aT = a.t.length;
        let bT = b.t.length;

        if (aT < bT) {
            return 1;
        } else if (aT > bT) {
            return -1;
        } else {
            return 0;
        }
    });

    let fields = [];

    for (let n = 10; n <= 10000000; n *= 10) {
        fields.push(n.toString() + '(ms)');
    }

    let data = [];

    funciones.forEach((f) => {
        let obj = {};
        obj['Method'] = f.n;
        fields.forEach((fld, ind) => {
            if (f.t[ind] !== undefined) {
                obj[fld] = f.t[ind];
            }
        });
        data.push(obj);
    });

    Printer.printTable(data);
}

test();

