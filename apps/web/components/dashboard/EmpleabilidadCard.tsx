// apps/web/components/dashboard/EmpleabilidadCard.tsx
import { Card, Metric, Text, BadgeDelta, Flex, ProgressBar } from '@tremor/react';

interface EmpleabilidadCardProps {
  tasaActual: number;         // ej: 73.4
  tasaCohorteAnterior: number; // ej: 68.1
  cohorte: string;            // ej: "2023"
  salarioPromedio: number | null;
  salarioDesviacion: number | null;
}

/** Calcula la variación porcentual y determina tendencia */
function calcularDelta(actual: number, anterior: number) {
  const diff = actual - anterior;
  const pct  = anterior > 0 ? (diff / anterior) * 100 : 0;
  return {
    valor:     Math.abs(pct).toFixed(1),
    tendencia: diff >= 0 ? 'moderateIncrease' : 'moderateDecrease',
    signo:     diff >= 0 ? '+' : '-',
  } as const;
}

export function EmpleabilidadCard({
  tasaActual,
  tasaCohorteAnterior,
  cohorte,
  salarioPromedio,
  salarioDesviacion,
}: EmpleabilidadCardProps) {
  const delta = calcularDelta(tasaActual, tasaCohorteAnterior);

  // Coeficiente de variación: mide dispersión relativa de salarios
  const cvSalario = (salarioPromedio !== null && salarioPromedio !== 0 && salarioDesviacion !== null)
    ? ((salarioDesviacion / salarioPromedio) * 100).toFixed(1)
    : null;

  return (
    <Card className="max-w-sm" decoration="top" decorationColor="emerald">
      <Flex justifyContent="between" alignItems="start">
        <div>
          <Text>Tasa de empleabilidad</Text>
          <Text className="text-tremor-content-subtle text-sm">
            Cohorte {cohorte}
          </Text>
        </div>
        <BadgeDelta deltaType={delta.tendencia} isIncreasePositive>
          {delta.signo}{delta.valor}% vs cohorte anterior
        </BadgeDelta>
      </Flex>

      <Metric className="mt-2">{tasaActual.toFixed(1)}%</Metric>

      <ProgressBar
        value={tasaActual}
        color="emerald"
        className="mt-3"
        tooltip={`${tasaActual.toFixed(1)}% de egresados contratados`}
      />

      {salarioPromedio !== null && (
        <div className="mt-4 pt-4 border-t border-tremor-border space-y-1">
          <Flex>
            <Text className="text-xs text-tremor-content-subtle">
              Salario promedio (μ)
            </Text>
            <Text className="text-xs font-medium">
              S/ {salarioPromedio.toLocaleString('es-PE')}
            </Text>
          </Flex>
          {salarioDesviacion !== null && (
            <Flex>
              <Text className="text-xs text-tremor-content-subtle">
                Desviación estándar (σ)
              </Text>
              <Text className="text-xs font-medium">
                ± S/ {salarioDesviacion.toLocaleString('es-PE')}
              </Text>
            </Flex>
          )}
          {cvSalario !== null && (
            <Flex>
              <Text className="text-xs text-tremor-content-subtle">
                Coeficiente de variación
              </Text>
              <Text className="text-xs font-medium text-amber-600">
                {cvSalario}%
              </Text>
            </Flex>
          )}
        </div>
      )}
    </Card>
  );
}