class Sorter {

    // O(n^2)
    static insertionSort(valores) {
        if (!validInput(valores)) { return; }

        let a, b;

        a = valores[0];
        for (let j = 0; j < valores.length; j++) {
            b = valores[j];
            if (b < a) {
                for (let k = j; k > 0; k--) {
                    if (b < valores[k - 1]) {
                        valores[k] = valores[k - 1];
                        valores[k - 1] = b
                    } else {
                        break;
                    }
                }
            } else {
                a = b;
            }
        }

        return valores; 
    }
    // O(n^2)
    static selectionSort(valores) {
        if (!validInput(valores)) { return; }

        let a, aPos;

        for (let j = 0; j < valores.length; j++) {
            a = valores[j];
            aPos = j;
            for (let k = j; k < valores.length; k++) {
                if (valores[k] < a) {
                    a = valores[k];
                    aPos = k
                }
            }
            valores[aPos] = valores[j];
            valores[j] = a;
        }

        return valores; 
    }

    static quickSort(valores) {
        if (!validInput(valores)) { return; }

        let listas;
        let p, pos;
        let j, k;
        let index;
        let val, largo;
        let chk = true;

        while (chk) {
            chk = false;
            if (Array.isArray(valores[0])) {
                listas = valores;
            } else {
                listas = [valores];
            }
            valores = [];
            listas.forEach((list) => {
                largo = list.length;
                if (list.length == 0) {
                    return;
                }
                index = list.findIndex((v) => {
                    return v != list[0];
                });
                if (index == -1) {
                    valores.push(list);
                    return;
                }
                chk = true;
                if (list.length == 2) {
                    pos = 0;
                    j = 0;
                    k = 1;
                } else if (list[list.length - 1] >= list[0] && list[list.length - 1] >= list[1]) {
                    if (list[0] > list[1]) {
                        pos = 0;
                        j = 1;
                    } else {
                        pos = 1;
                        j = 0;
                    }
                    k = list.length - 1;
                } else if (list[list.length - 1] <= list[0] && list[list.length - 1] <= list[1]) {
                    if (list[0] > list[1]) {
                        pos = 1;
                        j = 0;
                    } else {
                        pos = 0;
                        j = 1;
                    }
                    k = list.length - 1;
                } else {
                    pos = list.length - 1;
                    j = 0;
                    k = pos - 1;
                }
                p = list[pos]; 
                while (j < k) {
                    if (list[j] > p && list[k] < p) {
                        val = list[j];
                        list[j] = list[k];
                        list[k] = val;
                    }

                    if (list[j] <= p) {
                        j++;
                    }

                    if (list[k] >= p) {
                        k--;
                    }
                }
                if (j > pos) {
                    if (list[j] > p) {
                        j--;
                    }
                } else if (j < pos) {
                    if (list[j] <= p) {
                        j++;
                    }
                }
                val = list[j];
                list[j] = list[pos];
                list[pos] = val;
                if (list.length > 2) {
                    if (list.slice(0, j + 1).length == largo) {
                        j--;
                    }
                    valores.push(list.slice(0, j + 1), list.slice(j + 1));
                } else {
                    valores.push([list[0]], [list[1]]);
                }
            });
        }

        let valor = [];
        valores.forEach((list) => {
            list.forEach((v) => {
                valor.push(v);
            });
        });

        return valor;
    }

    static mergeSort(valores) {
        if (!validInput(valores)) { return; }

        let seccion = 1;
        let p;
        let lista;
        let limite = 1;

        while (limite < valores.length) {
            limite *= 2;
        }

        while (seccion < limite) {
            lista = valores;
            valores = [];
            for (let k = 0; k < lista.length; k += seccion*2) {
                p = 0;
                for (let m = k; m < k + seccion && m < lista.length; m++) {
                    for (let n = k + p + seccion; (n < k + seccion*2) && n < lista.length; n++) {
                        if (lista[m] > lista[n]) {
                            valores.push(lista[n]);
                            p++;
                        } else {
                            break;
                        }
                    }
                    valores.push(lista[m]);
                }
                let n = k + p + seccion;
                while ((n < k + seccion*2) && n < lista.length) {
                    valores.push(lista[n]);
                    p++;
                    n = k + p + seccion;
                }
            }
            seccion *= 2;
        }

        return valores;
    }

    static heapSort(valores) {
        if (!validInput(valores)) { return; }

        let val, parent, left, right, max, m, k;

        // Heapify
        for (let k = valores.length - 1; k > 0; k--) {
            parent = Math.floor((k-1)/2);
            m = k;
            while (valores[parent] < valores[m] && m > 0) {
                val = valores[parent];
                valores[parent] = valores[m];
                valores[m] = val;
                m = parent;
                parent = Math.floor((m-1)/2);
            }           
        }

        // Get max item of the array and setting the greater item of the last leaves
        val = valores[valores.length - 1];
        if ((valores.length)/2 == Math.floor((valores.length)/2)) {
            if (valores[valores.length - 1] < valores[valores.length - 2]) {
                val = valores[valores.length - 2];
                valores[valores.length - 2] = valores[valores.length - 1];
                valores[valores.length - 1] = val;
            }
        }
        valores[valores.length - 1] = valores[0];
        valores[0] = val;

        // Finding next greater value by bubbling down the leave on top
        for (let n = 1; n < valores.length; n++) {
            k = 0;
            while (k < valores.length - n) {
                left = 2*k + 1;
                right = 2*k + 2;

                if (left < valores.length - n) {
                    max = left;
                    if (right < valores.length - n) {
                        if (valores[left] < valores[right]) {
                            max = right;
                        }
                    }

                    if (valores[k] < valores[max]) {
                        val = valores[k];
                        valores[k] = valores[max];
                        valores[max] = val;
                        k = max;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }

            // Get the next grater value at the top of the tree
            val = valores[valores.length - n - 1];
            if ((valores.length - n)/2 == Math.floor((valores.length - n)/2)) {
                if (valores[valores.length - n - 1] < valores[valores.length - n - 2]) {
                    val = valores[valores.length - n - 2];
                    valores[valores.length - n - 2] = valores[valores.length - n - 1];
                    valores[valores.length - n - 1] = val;
                }
            }
            valores[valores.length - n - 1] = valores[0];
            valores[0] = val;
        }

        // Sorting last two items
        if (valores[1] < valores[0]) {
            val = valores[0];
            valores[0] = valores[1];
            valores[1] = val;
        }

        return valores;
    }

    static radixLSDSort (valores) {
        if (!validInput(valores)) { return; }

        // LSD radixSort

        let maxInt, bucket;
        valores.forEach((v) => {
            if (!maxInt || String(v).length > maxInt) {
                maxInt = String(v).length;
            }
        });

        for (let k = 0; k < maxInt; k++) {
            bucket = Array.from({length: 10}, () => {return [];});
            valores.forEach((v) => {
                let digit = String(v)[String(v).length - 1 - k];
                if (digit == undefined) {
                    bucket[0].push(v);
                } else {
                    bucket[Number(digit)].push(v);
                }
            });
            valores = [];
            bucket.forEach((list) => {
                list.forEach((val) => {
                    valores.push(val);
                });
            });
        }

        return valores;
    }

    static radixMSDSort (valores) {
        if (!validInput(valores)) { return; }

        // MSD radixSort

        let maxDigit, bucket;

        valores.forEach((v) => {
            if (!maxDigit || String(v).length > maxDigit) {
                maxDigit = String(v).length;
            }
        });

        for (let n = maxDigit; n > 0; n--) {
            bucket = Array.from({length: 10}, () => {return [];});
            valores.forEach((v) => {
                if (String(v).length < n) {
                    bucket[0].push(v);
                    return;
                }
                let digit = String(v)[n - 1];
                bucket[Number(digit)].push(v);
            });
            valores = [];
            bucket.forEach((list) => {
                list.forEach((val) => {
                    valores.push(val);
                });
            });
        }

        bucket = Array.from({length: maxDigit}, () => {return [];});
        valores.forEach((v) => {
            bucket[String(v).length - 1].push(v);
        });

        valores = [];
        bucket.forEach((list) => {
            list.forEach((val) => {
                valores.push(val);
            });
        });

        return valores;
    }

    static shellSort(valores) {
        if (!validInput(valores)) { return; }

        let a, b, paso, cont, start;
        let ciclos = 0;
        let f = (largo, loops) => {
            return half(largo, loops);
        }
        paso = f(valores.length, ciclos);
        cont = 0;
        while (paso > 0) {
            start = 0;
            while (start < paso) {
                a = valores[start];
                for (let k = start + paso; k < valores.length; k += paso) {
                    b = valores[k];
                    if (b < a) {
                        for (let j = k; j >= start; j -= paso) {
                            cont++;
                            if (b < valores[j - paso]) {
                                valores[j] = valores[j - paso];
                                valores[j - paso] = b;
                            } else {
                                break;
                            }
                        }
                    } else {
                        a = b;
                    }
                }
                start++;
            }
            if (paso > 1) {
                ciclos++;
                paso = f(valores.length, ciclos);
            } else {
                paso = 0;
            }
        }

        return valores; 
    }

    static bubbleSort(valores) {
        if (!validInput(valores)) { return; }

        let chk = true;
        let b, val;

        while (chk) {
            chk = false;
            for (let a = 0; a < valores.length - 1; a++) {
                b = a + 1;
                if (valores[b] < valores[a]) {
                    val = valores[b];
                    valores[b] = valores[a];
                    valores[a] = val;
                    chk = true;
                }
            }
        }

        return valores; 
    }

    static cocktailShakerSort(valores) {
        if (!validInput(valores)) { return; }

        let chk = true;
        let b, val;

        while (chk) {
            chk = false;
            for (let a = 0; a < valores.length - 1; a++) {
                b = a + 1;
                if (valores[b] < valores[a]) {
                    val = valores[b];
                    valores[b] = valores[a];
                    valores[a] = val;
                    chk = true;
                }
            }
            for (let a = valores.length - 1; a > 0; a--) {
                b = a - 1;
                if (valores[b] > valores[a]) {
                    val = valores[b];
                    valores[b] = valores[a];
                    valores[a] = val;
                    chk = true;
                }
            }
        }

        return valores; 
    }

    static gnomeSort (valores) { 
        if (!validInput(valores)) { return; }

        let k, b, val;
        k = 1;

        while ( k < valores.length) {
            b = k - 1;
            if (valores[b] > valores[k]) {
                val = valores[b];
                valores[b] = valores[k];
                valores[k] = val;
                k--;
            } else {
                k++;
            }
            if (k == 0) {
                k = 1;
            }
        }

        return valores; 
    }
}

function half(largo, ciclos) {
    let div = 2**(1 + ciclos);
    let paso = Math.floor(largo/div);

    if (paso < 1) {
        paso = 1;
    }
    return paso;
}

// largo >= 2^k - 1 -> largo + 1 >= 2^k

function hibbard(largo, ciclos) {
    let k = 0;
    while (largo + 1 >= 2 ** k) {
        k++;
    }
    while (ciclos >= 0) {
        k--;
        ciclos--;
    }
    if (k < 0) {
        k = 0;
    }
    return (2 ** k - 1);
}

function sedgewick(largo, ciclos) {
    let k = 0;
    let j = -1;
    let f, g, paso;
    while (largo >= 9*(4**k - 2**k) + 1 && largo >= (2**(j+2))*((2**(j+2))-3) + 1) {
        if (largo >= 9*(4**k - 2**k) + 1) {
            j++;
        }
        if (largo >= (2**(j+2))*((2**(j+2))-3) + 1) {
            k++;
        }
    }
    
    f = 9*(4**k - 2**k) + 1;
    g = (2**(j+2))*((2**(j+2))-3) + 1;
    // console.log(f);
    // console.log(g);
    // console.log('aquí');
    while (ciclos >= 0) {
        if (f > g) {
            paso = g;
            k--;
            f = 9*(4**k - 2**k) + 1;
        } else {
            paso = f;
            j--;
            g = (2**(j+2))*((2**(j+2))-3) + 1;
        }
        ciclos--;
    }

    // if (paso == f) {
    //     console.log(f);
    //     console.log((2**(j+2+1))*((2**(j+2+1))-3) + 1);
    // }

    // if (paso == g) {
    //     console.log(9*(4**(k+1) - 2**(k+1)) + 1);
    //     console.log(g);
    // }

    if (paso < 1) {
        paso = 1;
    }

    return paso;
}

function validInput(input) {
    let chk = Array.isArray(input);
    if (chk) {
        chk = input.length > 1;
    }
    return chk;
}

module.exports = {
    Sorter
}