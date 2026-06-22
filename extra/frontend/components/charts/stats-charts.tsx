"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { agentModeData, chartColors, languageData, tierChartData } from "@/lib/data/stats";

function Tip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; fill?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-bg-elevated px-3 py-2 text-xs">
      {label && <p className="font-medium text-fg mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill ?? chartColors.accent }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

export function StatsCharts() {
  const tierData = tierChartData();
  const modeData = agentModeData();
  const langData = languageData();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Coverage by tier</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64 min-h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tierData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: "#9399b2", fontSize: 11 }} />
                <YAxis tick={{ fill: "#9399b2", fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<Tip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="agents" name="Agents" fill={chartColors.agent} radius={[4, 4, 0, 0]} />
                <Bar dataKey="projects" name="Projects" fill={chartColors.project} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Agent modes</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64 min-h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={modeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none">
                  {modeData.map((e) => <Cell key={e.name} fill={e.fill} />)}
                </Pie>
                <Tooltip content={<Tip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Technology frequency across projects</CardTitle></CardHeader>
        <CardContent>
          <div className="h-72 min-h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={langData} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" tick={{ fill: "#9399b2", fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fill: "#9399b2", fontSize: 11 }} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="count" name="Projects" radius={[0, 4, 4, 0]}>
                  {langData.map((_, i) => (
                    <Cell key={i} fill={[chartColors.accent, chartColors.project, chartColors.agent, chartColors.modify, chartColors.accent2, chartColors.readOnly][i % 6]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
