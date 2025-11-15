import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

export function Header() {
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="text-xs text-slate-500 mb-1">Part / Product</div>
            <div className="font-medium">Frame Assembly XJ-2400</div>
            <div className="text-xs text-slate-600 mt-1">P/N: FA-XJ2400-R03</div>
          </Card>

          <Card className="p-4">
            <div className="text-xs text-slate-500 mb-1">Line & Station</div>
            <div className="font-medium">Line 3 / Station 12</div>
            <div className="text-xs text-slate-600 mt-1">Final Assembly</div>
          </Card>

          <Card className="p-4">
            <div className="text-xs text-slate-500 mb-1">Customer</div>
            <div className="font-medium">OEM Motors Inc.</div>
            <div className="text-xs text-slate-600 mt-1">Contract: QC-2024-0890</div>
          </Card>

          <Card className="p-4">
            <div className="text-xs text-slate-500 mb-1">Current Phase & Sampling</div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="default" className="bg-green-600">Production</Badge>
            </div>
            <div className="text-xs text-slate-600">AQL 1.0 Normal, Level II</div>
          </Card>

          <Card className="p-4">
            <div className="text-xs text-slate-500 mb-1">Standards in Force</div>
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge variant="outline" className="text-xs">ISO 9001</Badge>
              <Badge variant="outline" className="text-xs">IATF 16949</Badge>
              <Badge variant="outline" className="text-xs">ISO 2859-1</Badge>
            </div>
          </Card>
        </div>
      </div>
    </header>
  );
}
