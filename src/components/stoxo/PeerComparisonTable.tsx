import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ComparisonRow } from '@/hooks/useStoxoAI';
import { formatINR } from '@/lib/indian-stocks';

interface PeerComparisonTableProps {
  data: ComparisonRow[];
  title?: string;
}

export const PeerComparisonTable = ({ data, title = "Peer Comparison" }: PeerComparisonTableProps) => {
  if (!data?.length) return null;

  // Find best values for highlighting
  const bestPE = Math.min(...data.map(d => d.pe || Infinity));
  const bestROE = Math.max(...data.map(d => d.roe || 0));
  const bestReturn = Math.max(...data.map(d => d.oneYearReturn || -Infinity));
  const bestDividend = Math.max(...data.map(d => d.dividendYield || 0));
  const bestScore = Math.max(...data.map(d => d.score || 0));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold">Stock</TableHead>
                  <TableHead className="text-right font-semibold">Price</TableHead>
                  <TableHead className="text-right font-semibold">P/E</TableHead>
                  <TableHead className="text-right font-semibold">ROE %</TableHead>
                  <TableHead className="text-right font-semibold">1Y Return</TableHead>
                  <TableHead className="text-right font-semibold">Div Yield</TableHead>
                  <TableHead className="text-right font-semibold">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <motion.tr
                    key={row.symbol}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{row.symbol}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{row.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatINR(row.price)}
                    </TableCell>
                    <TableCell className={cn(
                      "text-right",
                      row.pe === bestPE && "text-success font-semibold"
                    )}>
                      {row.pe?.toFixed(1) || '-'}
                    </TableCell>
                    <TableCell className={cn(
                      "text-right",
                      row.roe === bestROE && "text-success font-semibold"
                    )}>
                      {row.roe?.toFixed(1) || '-'}%
                    </TableCell>
                    <TableCell className={cn(
                      "text-right",
                      row.oneYearReturn === bestReturn && "font-semibold"
                    )}>
                      <span className={cn(
                        "inline-flex items-center gap-0.5",
                        row.oneYearReturn >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {row.oneYearReturn >= 0 ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {row.oneYearReturn >= 0 ? '+' : ''}{row.oneYearReturn?.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className={cn(
                      "text-right",
                      row.dividendYield === bestDividend && "text-success font-semibold"
                    )}>
                      {row.dividendYield?.toFixed(2) || '-'}%
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-semibold",
                      row.score >= 70 ? "text-success" :
                      row.score >= 40 ? "text-warning" : "text-destructive"
                    )}>
                      {row.score}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
