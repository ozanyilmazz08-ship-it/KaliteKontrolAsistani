import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Info } from 'lucide-react';

interface FormulaTooltipProps {
  title: string;
  formula: string;
  explanation: string;
  reference?: string;
  assumptions?: string[];
}

export function FormulaTooltip({ 
  title, 
  formula, 
  explanation, 
  reference,
  assumptions 
}: FormulaTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center ml-1 text-muted-foreground hover:text-foreground">
            <Info className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-4" side="right">
          <div className="space-y-2">
            <div>
              <p className="text-sm font-semibold">{title}</p>
            </div>
            <div className="bg-gray-100 p-2 rounded font-mono text-xs">
              {formula}
            </div>
            <p className="text-xs text-muted-foreground">{explanation}</p>
            {assumptions && assumptions.length > 0 && (
              <div className="text-xs">
                <p className="font-semibold text-muted-foreground">Assumptions:</p>
                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                  {assumptions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
            {reference && (
              <p className="text-xs text-blue-600 italic">Ref: {reference}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
