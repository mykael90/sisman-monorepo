import { Prisma } from '@sisman/prisma';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ComputedFieldsMaterialWarehouseStocks {
  physicalOnHandQuantity = Prisma.defineExtension({
    name: 'physicalOnHandQuantity',
    result: {
      materialWarehouseStock: {
        physicalOnHandQuantity: {
          needs: { initialStockQuantity: true, balanceInMinusOut: true },
          // 1. ATUALIZAMOS O TIPO DE RETORNO para indicar que a função pode retornar null.
          compute(stock: {
            initialStockQuantity: Prisma.Decimal | null;
            balanceInMinusOut: Prisma.Decimal | null;
          }): Prisma.Decimal | null {
            // <-- O retorno agora também pode ser nulo

            // 2. VERIFICAÇÃO CONDICIONAL PRIMEIRO.
            // Se a quantidade inicial for nula, o estoque em mãos é nulo. Fim da lógica.
            if (stock.initialStockQuantity === null) {
              return null;
            }

            // 3. SE a quantidade inicial EXISTE, procedemos com o cálculo.
            // Como passamos da verificação acima, 'initialStockQuantity' é garantidamente um Decimal.
            // Ainda tratamos 'balanceInMinusOut' como potencialmente nulo, convertendo-o para zero se necessário.
            const balance = stock.balanceInMinusOut ?? new Prisma.Decimal(0);

            // A soma agora é segura.
            return stock.initialStockQuantity.add(balance);
          }
        }
      }
    }
  });
}
