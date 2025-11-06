import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { useRCA } from '../../contexts/RCAContext';
import type { RCAMethod } from '../../types/rca';

const methods: { value: RCAMethod; label: string }[] = [
  { value: '5whys', label: '5 Whys' },
  { value: 'fishbone', label: 'Fishbone' },
  { value: 'pareto', label: 'Pareto' },
  { value: 'fmea', label: 'FMEA' },
  { value: 'fta', label: 'FTA' },
  { value: 'affinity', label: 'Affinity' },
  { value: 'scatter', label: 'Scatter' }
];

export function MethodTabs() {
  const { currentMethod, setCurrentMethod } = useRCA();

  return (
    <div className="border-b bg-background px-6">
      <Tabs value={currentMethod} onValueChange={(value) => setCurrentMethod(value as RCAMethod)}>
        <TabsList className="h-12 bg-transparent border-b-0">
          {methods.map(method => (
            <TabsTrigger
              key={method.value}
              value={method.value}
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              {method.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
