import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { BookOpen, GraduationCap, FileText, ExternalLink } from "lucide-react";

export function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="lg">
          <BookOpen className="h-4 w-4 mr-2" />
          Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Process Capability & Performance — Help & References</DialogTitle>
          <DialogDescription>
            Comprehensive guide to capability analysis, formulas, and best practices
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="formulas">Formulas</TabsTrigger>
            <TabsTrigger value="guidance">Guidance</TabsTrigger>
            <TabsTrigger value="references">References</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] mt-4">
            <TabsContent value="overview" className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">What is Process Capability?</h3>
                <p className="text-sm text-slate-600">
                  Process capability compares the natural variation of a process to specification limits. 
                  It quantifies whether a process can consistently produce output within customer requirements.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Short-term vs Long-term</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="font-medium text-blue-900 mb-1">Short-term (Cp/Cpk)</p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Uses σ̂<sub>within</sub> (within-subgroup variation)</li>
                      <li>• Isolates inherent, random variation</li>
                      <li>• Best-case capability if perfectly controlled</li>
                      <li>• Answers: "What can the process achieve?"</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-purple-50 rounded border border-purple-200">
                    <p className="font-medium text-purple-900 mb-1">Long-term (Pp/Ppk)</p>
                    <ul className="text-xs text-purple-700 space-y-1">
                      <li>• Uses σ̂<sub>overall</sub> (total variation)</li>
                      <li>• Includes drift, shifts, special causes</li>
                      <li>• Real-world performance over time</li>
                      <li>• Answers: "What is the actual performance?"</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Key Indices</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">Cp/Pp</Badge>
                    <p className="text-xs text-slate-600">
                      Potential capability (assumes perfect centering). Measures spread vs tolerance.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">Cpk/Ppk</Badge>
                    <p className="text-xs text-slate-600">
                      Actual capability (accounts for centering). Most important index; compares closest spec limit.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">Cpm</Badge>
                    <p className="text-xs text-slate-600">
                      Taguchi index. Penalizes off-target performance. Requires Target to be specified.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">Z-level</Badge>
                    <p className="text-xs text-slate-600">
                      Sigma level. Z = 3×Cpk. Six Sigma quality = Z ≥ 6.0 (short-term).
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Acceptance Criteria (typical)</h3>
                <div className="space-y-1 text-xs text-slate-600">
                  <p>• Cpk ≥ 1.67 (5σ): Excellent</p>
                  <p>• Cpk ≥ 1.33 (4σ): Adequate (typical automotive target)</p>
                  <p>• Cpk ≥ 1.00 (3σ): Marginal (99.73% yield if centered)</p>
                  <p>• Cpk &lt; 1.00: Poor (improvement required)</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="formulas" className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Short-term Capability Indices</h3>
                <div className="space-y-2 text-sm font-mono bg-slate-50 p-3 rounded">
                  <p>Cp = (USL − LSL) / (6 × σ̂<sub>within</sub>)</p>
                  <p>Cpu = (USL − μ̂) / (3 × σ̂<sub>within</sub>)</p>
                  <p>Cpl = (μ̂ − LSL) / (3 × σ̂<sub>within</sub>)</p>
                  <p>Cpk = min(Cpu, Cpl)</p>
                  <p>Cpm = (USL − LSL) / [6 × √(σ̂² + (μ̂ − T)²)]</p>
                  <p>Z<sub>st</sub> = 3 × Cpk (two-sided)</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Long-term Performance Indices</h3>
                <div className="space-y-2 text-sm font-mono bg-slate-50 p-3 rounded">
                  <p>Pp = (USL − LSL) / (6 × σ̂<sub>overall</sub>)</p>
                  <p>Ppu = (USL − μ̂) / (3 × σ̂<sub>overall</sub>)</p>
                  <p>Ppl = (μ̂ − LSL) / (3 × σ̂<sub>overall</sub>)</p>
                  <p>Ppk = min(Ppu, Ppl)</p>
                  <p>Z<sub>lt</sub> = 3 × Ppk</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Within-Subgroup Estimators (σ̂<sub>within</sub>)</h3>
                <div className="space-y-2 text-sm font-mono bg-slate-50 p-3 rounded">
                  <p>R̄/d₂: σ̂ = R̄ / d₂(m) where R̄ = average range</p>
                  <p>S̄/c₄: σ̂ = S̄ / c₄(m) where S̄ = average std dev</p>
                  <p>Pooled s: σ̂ = √[Σ(m−1)s²ᵢ / Σ(m−1)]</p>
                  <p>MR/d₂: σ̂ = MR̄ / d₂(2) for Individuals</p>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  d₂ and c₄ are bias-correction constants that depend on subgroup size m.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Defect Metrics</h3>
                <div className="space-y-2 text-sm font-mono bg-slate-50 p-3 rounded">
                  <p>% &lt; LSL = Φ((LSL − μ̂) / σ̂) × 100</p>
                  <p>% &gt; USL = [1 − Φ((USL − μ̂) / σ̂)] × 100</p>
                  <p>PPM<sub>total</sub> = (% &lt; LSL + % &gt; USL) × 10⁶</p>
                  <p>Yield = 100 − (% &lt; LSL + % &gt; USL)</p>
                  <p>Z<sub>bench</sub> = Φ⁻¹(1 − %Out/2)</p>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  Φ is the standard normal cumulative distribution function.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="guidance" className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Prerequisites</h3>
                <div className="space-y-2">
                  <div className="p-3 bg-amber-50 rounded border border-amber-200">
                    <p className="font-medium text-amber-900 mb-1">1. Process Stability</p>
                    <p className="text-xs text-amber-700">
                      Capability assumes statistical control. Review control chart for out-of-control points, 
                      runs, trends. Remove special causes before capability study.
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded border border-amber-200">
                    <p className="font-medium text-amber-900 mb-1">2. Measurement System Analysis (MSA)</p>
                    <p className="text-xs text-amber-700">
                      Gage R&R must be acceptable (&lt;10% excellent, &lt;30% marginal). 
                      Bias and linearity should be within tolerance. At least 5 distinct categories.
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded border border-amber-200">
                    <p className="font-medium text-amber-900 mb-1">3. Adequate Sample Size</p>
                    <p className="text-xs text-amber-700">
                      N ≥ 25 for stable CI estimates. For subgroups, 20+ subgroups recommended. 
                      Larger samples improve precision.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">When Data Are Non-Normal</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>
                    <strong>Test normality:</strong> Use Shapiro-Wilk, Anderson-Darling, probability plots. 
                    If p &lt; 0.05, reject normality assumption.
                  </p>
                  <p><strong>Options:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-4 text-xs">
                    <li><strong>Fit-based:</strong> Fit Weibull, Lognormal, Gamma, etc. Use fitted percentiles for capability.</li>
                    <li><strong>Transform:</strong> Box-Cox or Johnson transformation to normalize, then standard indices.</li>
                    <li><strong>Percentile:</strong> Distribution-free method using empirical quantiles (Q<sub>0.00135</sub>, Q<sub>0.99865</sub>).</li>
                  </ol>
                  <p className="mt-2 text-xs italic">
                    Auto-selection: picks best fit by AD test. Switch to Transform or Percentile per SOP if needed.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Outlier Handling</h3>
                <p className="text-sm text-slate-600 mb-2">
                  Outliers inflate σ̂ and deflate Cp/Cpk. However, <strong>never remove outliers</strong> without:
                </p>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside ml-4">
                  <li>Documented investigation (root cause)</li>
                  <li>SOP approval and justification</li>
                  <li>Audit trail (who, when, why)</li>
                </ul>
                <p className="text-xs text-slate-600 mt-2">
                  Use robust estimators (Median, MAD) instead of removal when appropriate.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Reporting Best Practices</h3>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside ml-4">
                  <li>Always report both Cp and Cpk (spread + centering)</li>
                  <li>Include confidence intervals to show estimate precision</li>
                  <li>State assumptions: normality, stability, sample size, estimator</li>
                  <li>Link to control chart and MSA report</li>
                  <li>Use consistent terminology: short-term vs long-term</li>
                  <li>For executives: translate to PPM, Yield, Z-level</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="references" className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Authoritative Sources</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">Montgomery, D.C. — Introduction to Statistical Quality Control (8th ed.)</p>
                        <p className="text-xs text-slate-600 mt-1">
                          Comprehensive coverage of Cp/Cpk, Pp/Ppk, control charts, and rational subgrouping. 
                          Chapter 9: Process Capability Analysis.
                        </p>
                      </div>
                      <GraduationCap className="h-5 w-5 text-blue-600 ml-2" />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">AIAG — Statistical Process Control (SPC) Handbook (2nd ed.)</p>
                        <p className="text-xs text-slate-600 mt-1">
                          Automotive industry standard. Defines capability indices, rational subgrouping, 
                          and SPC implementation for IATF 16949.
                        </p>
                      </div>
                      <FileText className="h-5 w-5 text-green-600 ml-2" />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">ISO 22514 series — Statistical methods in process management</p>
                        <p className="text-xs text-slate-600 mt-1">
                          International standard for capability/performance indices (Parts 1-8). 
                          Defines terminology, calculation methods, and interpretation.
                        </p>
                      </div>
                      <FileText className="h-5 w-5 text-purple-600 ml-2" />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">NIST/SEMATECH e-Handbook of Statistical Methods</p>
                        <p className="text-xs text-slate-600 mt-1">
                          Public resource. Chapter 6.3: Process Capability. 
                          Covers normality tests, non-normal methods, confidence intervals, bootstrap.
                        </p>
                      </div>
                      <ExternalLink className="h-5 w-5 text-orange-600 ml-2" />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">Wheeler, D.J. — Understanding Statistical Process Control (3rd ed.)</p>
                        <p className="text-xs text-slate-600 mt-1">
                          Practical SPC guide. Emphasizes stability prerequisite, rational subgrouping, 
                          and rolling capability for drift detection.
                        </p>
                      </div>
                      <GraduationCap className="h-5 w-5 text-blue-600 ml-2" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Online Resources</h3>
                <div className="space-y-2 text-sm">
                  <a href="#" className="flex items-center gap-2 text-blue-600 hover:underline">
                    <ExternalLink className="h-4 w-4" />
                    NIST e-Handbook: Process Capability (itl.nist.gov)
                  </a>
                  <a href="#" className="flex items-center gap-2 text-blue-600 hover:underline">
                    <ExternalLink className="h-4 w-4" />
                    ASQ Process Capability Resources
                  </a>
                  <a href="#" className="flex items-center gap-2 text-blue-600 hover:underline">
                    <ExternalLink className="h-4 w-4" />
                    ISO 22514 Standards Collection
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-slate-600 italic">
                  This module implements methods consistent with Montgomery, AIAG, ISO 22514, and NIST guidelines. 
                  For regulatory or contractual requirements, consult your organization's SOP and quality manual.
                </p>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
