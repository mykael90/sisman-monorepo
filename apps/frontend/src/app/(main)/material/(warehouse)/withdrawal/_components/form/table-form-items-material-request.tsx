'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Minus, Plus, Info } from 'lucide-react';
import { InfoHoverCard } from '@/components/info-hover-card';
import { IMaterialWithdrawalItemAddForm } from '../../withdrawal-types';
import { useMemo } from 'react';
import { IItemWithdrawalMaterialRequestForm } from '../card-material-link-details';
import { useMediaQuery } from '@/hooks/use-media-query';
import { CardFormItemMaterialRequest } from './card-form-item-material-request';

interface TableFormItemsMaterialRequestProps {
  materialsInfo: IItemWithdrawalMaterialRequestForm[];
  materials: IMaterialWithdrawalItemAddForm[];
  onRemove: (key: number) => void;
  onUpdateQuantity: (key: number, quantity: number) => void;
  hideMaterialRequestItemId?: boolean;
  readOnly?: boolean;
}

export function TableFormItemsMaterialRequest({
  materialsInfo,
  materials,
  onRemove,
  onUpdateQuantity,
  readOnly = false
}: TableFormItemsMaterialRequestProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Criamos um mapa para busca rápida das informações.
  // Usamos `useMemo` para que este mapa seja criado apenas uma vez, e não a cada renderização.
  console.log(`materialsInfo: ${JSON.stringify(materialsInfo)}`);
  const infoMap = useMemo(() => {
    const map = new Map<number, IItemWithdrawalMaterialRequestForm>();

    // Adiciona uma verificação para garantir que materialsInfo é um array
    if (Array.isArray(materialsInfo)) {
      materialsInfo.forEach((material) => {
        map.set(material.key, material);
      });
    }
    return map;
  }, [materialsInfo]);

  // Exemplo de como ver o conteúdo de forma mais explícita se precisar
  // if (infoMap.size > 0) {
  //   console.log(
  //     'Conteúdo do infoMap como objeto:',
  //     Object.fromEntries(infoMap)
  //   );
  // }

  // Função para limitar a quantidade até o saldo potencial livre
  const getClampedQuantity = (
    material: IItemWithdrawalMaterialRequestForm,
    newQuantity: number
  ): number => {
    const balancePotential = Number(material.quantityBalancePotential);
    const isFreeBalanceDefined = !isNaN(balancePotential);
    let quantity = Math.max(0, newQuantity);

    if (isFreeBalanceDefined) {
      quantity = Math.min(balancePotential, quantity);
    }
    return quantity;
  };

  const handleQuantityChange = (key: number, change: number) => {
    const material = materials.find((m) => m.key === key);
    const materialInfo = infoMap.get(key);

    if (material && materialInfo) {
      const newQuantity = Number(material.quantityWithdrawn) + change;
      onUpdateQuantity(key, getClampedQuantity(materialInfo, newQuantity));
    }
  };

  const handleManualQuantityChange = (key: number, value: string) => {
    const materialInfo = infoMap.get(key);
    if (!materialInfo) return;

    if (value === '') {
      onUpdateQuantity(key, 0);
      return;
    }

    // Para permitir decimais, trocamos parseInt por parseFloat.
    // Também substituímos a vírgula pelo ponto para garantir a conversão correta.
    const newQuantity = parseFloat(value.replace(',', '.'));
    if (!isNaN(newQuantity)) {
      onUpdateQuantity(key, getClampedQuantity(materialInfo, newQuantity));
    }
  };

  if (materials.length === 0) {
    return (
      <div className='text-muted-foreground py-8 text-center'>
        {readOnly
          ? 'No materials for this request.'
          : 'Nenhum material adicionado, utilize o botão para adicionar.'}
      </div>
    );
  }

  if (!isDesktop) {
    return (
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {materials.map((material) => (
          <CardFormItemMaterialRequest
            key={material.key}
            material={material}
            info={infoMap.get(material.key)}
            onRemove={onRemove}
            onUpdateQuantity={onUpdateQuantity}
            handleQuantityChange={handleQuantityChange}
            handleManualQuantityChange={handleManualQuantityChange}
            readOnly={readOnly}
          />
        ))}
      </div>
    );
  }

  return (
    <div className='overflow-hidden rounded-lg border'>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>
                ID Material Global
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>
                Nome do Material
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>
                Unidade de Medida
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>
                R$ Unitário
              </th>
              <th className='px-4 py-3 text-center text-sm font-medium text-gray-900'>
                Solicitado na RM
              </th>
              <th className='px-4 py-3 text-center text-sm font-medium text-gray-900'>
                <div className='flex items-center justify-center gap-2'>
                  <div className='w-min'>Saldo Efetivo</div>
                  <InfoHoverCard
                    title='Cálculo do Saldo Efetivo Livre'
                    subtitle='Representa o saldo físico disponível (livre) agora.'
                    content={
                      <>
                        <p className='pl-2 text-green-700'>+ Qtd. Recebida</p>
                        <p className='pl-2 text-red-700'>- Qtd. Retirada</p>
                        <p className='pl-2 text-red-700'>- Qtd. Reservada</p>
                        <p className='pl-2 text-red-700'>- Qtd. Restrita</p>
                      </>
                    }
                  />
                </div>
              </th>
              <th className='px-4 py-3 text-center text-sm font-medium text-gray-900'>
                <div className='flex items-center justify-center gap-2'>
                  <div className='w-min'>Saldo Potencial</div>
                  <InfoHoverCard
                    title='Cálculo do Saldo Potencial'
                    subtitle='É o saldo que estará disponível para retirada nesta
                          solicitação. Considera a quantidade solicitada e
                          ignora a quantidade restrita (caso necessário a
                          quantidade restrita é desbloqueada automaticamente
                          durante a retirada).'
                    content={
                      <>
                        <p className='pl-2 text-green-700'>+ Qtd. Solicitada</p>
                        <p className='pl-2 text-red-700'>- Qtd. Retirada</p>
                        <p className='pl-2 text-red-700'>- Qtd. Reservada</p>
                      </>
                    }
                  />
                </div>
              </th>
              <th className='px-4 py-3 text-center text-sm font-medium text-gray-900'>
                Retirar
              </th>
              {!readOnly && (
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {materials.map((material) => {
              // Para cada item do estado, buscamos a informação estática no nosso mapa.
              const info = infoMap.get(material.key);

              // console.log(`key: ${material.key}`);
              // console.log(infoMap);

              //  Campo NÃO vinculado ao estado: vem do `infoMap`
              const freeBalanceEffective = Number(
                info?.quantityFreeBalanceEffective
              );
              const isFreeBalanceEffectiveDefined =
                !isNaN(freeBalanceEffective);

              const balancePotential = Number(info?.quantityBalancePotential);
              const isFreeBalanceDefined = !isNaN(balancePotential);

              return (
                <tr key={material.key} className='hover:bg-gray-50'>
                  <td className='px-4 py-3 text-sm font-medium text-gray-900'>
                    {material.globalMaterialId}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-900'>
                    <div className='flex items-center justify-start gap-2'>
                      {info?.name}
                      <InfoHoverCard
                        title='Descrição do Material'
                        content={info?.description}
                        className='w-200'
                      />
                    </div>
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-900'>
                    {info?.unitOfMeasure}
                  </td>
                  <td className='px-4 py-3 text-right text-sm text-gray-900'>
                    {material.unitPrice ? (
                      // Number(material.unitPrice).toLocaleString('pt-BR', {
                      //   style: 'currency',
                      //   currency: 'BRL'
                      // })
                      <Badge variant={'secondary'}>
                        {Number(material.unitPrice).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </Badge>
                    ) : (
                      <Badge variant='outline'>Indefinido</Badge>
                    )}
                  </td>
                  {/* AJUSTE: Adicionado HoverCard com detalhes na coluna Solicitado */}
                  <td className='px-4 py-3 text-right text-sm'>
                    <div className='flex items-center justify-center gap-2'>
                      <Badge variant='outline'>
                        {Number(info?.quantityRequested)}
                      </Badge>
                      <InfoHoverCard
                        title='Detalhes das Movimentações'
                        subtitle='Movimentações referentes a requisição de material.'
                        content={
                          <>
                            <div className='flex justify-between'>
                              <span>Recebido:</span>
                              <span>{Number(info?.quantityReceivedSum)}</span>
                            </div>
                            <div className='flex justify-between'>
                              <span>Retirado:</span>
                              <span>{Number(info?.quantityWithdrawnSum)}</span>
                            </div>
                            <div className='flex justify-between'>
                              <span>Reservado:</span>
                              <span>{Number(info?.quantityReserved)}</span>
                            </div>
                            <div className='flex justify-between'>
                              <span>Restrito:</span>
                              <span>{Number(info?.quantityRestricted)}</span>
                            </div>
                          </>
                        }
                      />
                    </div>
                  </td>
                  <td className='px-4 py-3 text-right text-sm'>
                    {isFreeBalanceEffectiveDefined ? (
                      <Badge
                        variant={
                          // freeBalanceEffective > 50
                          //   ? 'default'
                          //   : freeBalanceEffective > 10
                          //     ? 'secondary'
                          //     : 'destructive'
                          'outline'
                        }
                      >
                        {freeBalanceEffective}
                      </Badge>
                    ) : (
                      <Badge variant='outline'>Indefinido</Badge>
                    )}
                  </td>
                  <td className='px-4 py-3 text-right text-sm'>
                    {isFreeBalanceDefined ? (
                      <Badge
                        variant={
                          // balancePotential > 50
                          //   ? 'default'
                          //   : balancePotential > 10
                          //     ? 'secondary'
                          //     : 'destructive'
                          'default'
                        }
                      >
                        {balancePotential}
                      </Badge>
                    ) : (
                      <Badge variant='outline'>Indefinido</Badge>
                    )}
                  </td>
                  <td className='px-4 py-3'>
                    {readOnly ? (
                      <p className='text-center text-gray-900'>
                        {Number(material.quantityWithdrawn)}
                      </p>
                    ) : (
                      <div className='flex items-center justify-center gap-2'>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => handleQuantityChange(material.key, -1)}
                          disabled={Number(material.quantityWithdrawn) <= 0}
                        >
                          <Minus className='h-3 w-3' />
                        </Button>
                        <Input
                          type='number'
                          step='any'
                          value={String(material.quantityWithdrawn)}
                          onChange={(e) =>
                            handleManualQuantityChange(
                              material.key,
                              e.target.value
                            )
                          }
                          className='w-18 text-center'
                          min='0'
                        />
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => handleQuantityChange(material.key, 1)}
                          disabled={
                            isFreeBalanceDefined &&
                            Number(material.quantityWithdrawn) >=
                              balancePotential
                          }
                        >
                          <Plus className='h-3 w-3' />
                        </Button>
                      </div>
                    )}
                  </td>
                  {!readOnly && (
                    <td className='px-4 py-3'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => onRemove(material.key)}
                        className='hover:bg-destructive text-destructive hover:text-white'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
