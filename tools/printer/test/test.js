const { Printer } = require('../Printer');

let obj = [
    {
        f1: "f1",
        f2: 4,
        f3: true,
        f4: [1, 2, 3],
        f5: {
            a: "ab",
            b: 2,
            c: false
        },
        f6: function () {
            return 'hola'
        },
        f7: ft()
    }
];

function ft () {
    return 'adios'
}

Printer.printTable(obj);