const { stdout } = require('process');

class Printer {
    static printTable(data = []) {
        if (!Array.isArray(data)) {
            return;
        }
        
        let headers = [];
        let sizes = [];
        let dashes = '';
        
        // Get min widths required to display all values of each field
        data.forEach((d) => {
            if (typeof d !== 'object') { return; }
            if (Array.isArray(d)) { return; }
    
            Object.keys(d).forEach((k) => {
                let index = headers.findIndex((val) => {
                    return val == k;
                });
    
                if (index == -1) {
                    headers.push(k);
                    sizes.push(k.length);
                    index = headers.length - 1;
                }
                
                if (typeof d[k] == 'object') {
                    if (JSON.stringify(d[k]).length > sizes[index]) {
                        sizes[index] = JSON.stringify(d[k]).length;
                    }
                } else {
                    if (d[k].toString().length > sizes[index]) {
                        sizes[index] = d[k].toString().split(/[\r\n]+/).map((str) => { return str.trim() }).join(' ').length;
                    }
                }
            });
        })
        
        // Create a dashed row to use as the delimitation between rows
        sizes.forEach((s) => {
            dashes += fillStringValue('+', s + 2, '-');
        });
        dashes += '+';
        stdout.write('\n' + dashes + '\n'); 

        // Writes header rows
        headers.forEach((h, ind) => {
            let info = fillStringValue(h, sizes[ind]);
            stdout.write('|' + info + ' ');
        });
        stdout.write('|\n'); 
        stdout.write(dashes + '\n');

        // Writes data rows
        data.forEach((d) => {
            headers.forEach((h, ind) => {
                let info = '';
                if (d[h] !== undefined) {
                    if (typeof d[h] == 'object') {
                        info += JSON.stringify(d[h]);
                    } else {
                        info += d[h].toString().split(/[\r\n]+/).map((str) => { return str.trim() }).join(' ');
                    }
                }
                
                info = fillStringValue(info, sizes[ind]);
                stdout.write('|' + info + ' ');
            });
            stdout.write('|\n');
            stdout.write(dashes + '\n');
        });
    }
}

function fillStringValue(value = '', size = 1, filler = ' ') {
    value = value.toString();
    return value + Array.from({ length: size - value.length}, () => {
        return filler;
    }).join('');
}

module.exports = {
    Printer
}