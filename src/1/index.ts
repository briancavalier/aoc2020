const inputs = [
  1711, 1924, 1384, 1590, 1876, 1918, 2003, 1514, 1608, 1984, 1706, 1375, 1476, 1909, 1615, 1879, 1940, 1945, 1899, 1510, 1657, 1685, 1588, 1884, 1864, 1995, 1648, 1713, 1532, 1556, 1572, 1667, 1861, 1773, 1501, 1564, 1756, 395, 1585, 1717, 1553, 1487, 1617, 1808, 1780, 1570, 1881, 1992, 1894, 1772, 1837, 2002, 1659, 1731, 1873, 1760, 552, 1575, 1597, 1986, 1416, 1398, 1737, 1027, 1457, 198, 1904, 1753, 1727, 633, 1577, 1944, 1369, 1400, 1843, 1966, 1008, 1681, 1890, 1939, 1605, 1548, 1953, 1839, 1409, 1592, 1744, 1761, 1613, 1412, 1759, 703, 1498, 1941, 1425, 1528, 1469, 1728, 1447, 1406, 1797, 1543, 1682, 1722, 1723, 1893, 1644, 796, 1505, 1715, 1729, 1943, 1626, 1602, 1964, 1509, 1816, 1660, 1399, 1996, 1750, 1701, 1963, 1979, 1558, 1506, 1465, 2001, 1935, 1616, 1990, 1946, 1818, 1892, 1431, 1832, 1688, 2004, 1424, 1716, 1897, 1931, 1557, 1389, 1872, 1640, 1670, 1911, 1427, 1730, 211, 1420, 1488, 1689, 1383, 1967, 1594, 642, 1622, 1627, 1607, 1372, 1596, 1451, 1693, 1380, 1745, 1908, 1785, 1646, 1824, 1418, 1258, 1664, 1631, 1459, 1901, 1838, 1794, 1815, 1388, 1809, 1920, 1411, 1593, 1676, 1610, 1629, 1512, 1522, 1649, 1740, 1695, 1504, 1856, 1791, 1898, 1661, 1806, 1851
] as const

export const find2 = <Sum, Values extends readonly any[], Value extends Values[number]>(target: Sum, evaluate: (v1: Value, v2: Value) => Sum, values: Values): [Value, Value] | undefined => {
  for (const v1 of values) {
    for (const v2 of values) {
      if (evaluate(v1, v2) === target) return [v1, v2]
    }
  }
}

export const find3 = <Sum, Values extends readonly any[], Value extends Values[number]>(target: Sum, evaluate: (v1: Value, v2: Value, v3: Value) => Sum, values: Values): [Value, Value, Value] | undefined => {
  for (const v1 of values) {
    for (const v2 of values) {
      for (const v3 of values) {
        if (evaluate(v1, v2, v3) === target) return [v1, v2, v3]
      }
    }
  }
}

export const sum = (...values: readonly number[]): number => values.reduce((v1, v2) => v1 + v2)
export const product = (...values: readonly number[]): number => values.reduce((v1, v2) => v1 * v2)

const found2 = find2(2020, sum, inputs)

if (!found2) console.log('2020 pair sum not found!')
else console.log(`${found2.join(' * ')} = ${product(...found2)}`)

const found3 = find3(2020, sum, inputs)

if (!found3) console.log('2020 triple sum not found!')
else console.log(`${found3.join(' * ')} = ${product(...found3)}`)
