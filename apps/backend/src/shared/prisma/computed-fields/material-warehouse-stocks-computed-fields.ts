// import { Prisma } from '@sisman/prisma';
// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class ComputedFieldsMaterialWarehouseStocks {
//   physicalOnHandQuantity = Prisma.defineExtension({
//     name: 'physicalOnHandQuantity',
//     result: {
//       materialWarehouseStock: {
//         physicalOnHandQuantity: {
//           needs: { initialStockQuantity: true, balanceInMinusOut: true },
//           compute(stock: {
//             initialStockQuantity: Prisma.Decimal;
//             balanceInMinusOut: Prisma.Decimal;
//           }): Prisma.Decimal {
//             // A soma de dois campos do tipo Decimal deve ser feita com o método .add()
//             // para garantir a precisão matemática e evitar erros de concatenação de string.
//             // O operador '+' não é sobrecarregado para objetos Decimal.
//             return stock.initialStockQuantity.add(stock.balanceInMinusOut);
//           }
//         }
//       }
//     }
//   });
// }
