import { Info, Trophy } from "lucide-react";
import { Link } from "wouter";

const teamData = [
  {
    rank: 6,
    name: "Tony Diaz",
    isYou: false,
    texts: 0, emails: 0, calls: 0,
    newRel: 0, upgr: 0,
    new: 0, reopen: 0, ratio: 0,
    offers: 0, negot: 0, accept: 0, acq: 0,
    time: "0m",
    highlighted: false,
  },
  {
    rank: 4,
    name: "Josh Santos",
    isYou: true,
    texts: 0, emails: 0, calls: 0,
    newRel: 1, upgr: 0,
    new: 6, reopen: 0, ratio: "0.0",
    offers: 0, negot: 0, accept: 0, acq: 0,
    time: "2m",
    highlighted: true,
  },
  {
    rank: null,
    name: "Faisal Nazik",
    isYou: false,
    texts: 0, emails: 1, calls: 0,
    newRel: 0, upgr: 0,
    new: 0, reopen: 1, ratio: 0,
    offers: 0, negot: 0, accept: 0, acq: 0,
    time: "2m",
    highlighted: false,
  },
  {
    rank: "#4",
    name: "Haris Aqeel",
    isYou: false,
    texts: 0, emails: 0, calls: 0,
    newRel: 0, upgr: 0,
    new: 0, reopen: 0, ratio: 0,
    offers: 0, negot: 0, accept: 0, acq: 0,
    time: "0m",
    highlighted: false,
  },
];

export default function TeamLeaderboard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-1.5">
        <Trophy className="w-4 h-4 text-yellow-500" />
        <span className="text-sm font-semibold text-gray-800">Team Leaderboard</span>
        <Info className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
        <Link href="/adaptation-reports" className="ml-auto text-xs font-medium text-orange-500 hover:text-orange-600 hover:underline">
          Adaptation Reports →
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="w-6"></th>
              <th className="text-left py-2 px-3 text-gray-500 font-medium w-32">Name</th>
              {/* Communication group */}
              <th colSpan={3} className="text-center py-1 text-[10px] font-semibold text-orange-500 uppercase tracking-wide border-b-0">Communication</th>
              {/* Relationships group */}
              <th colSpan={2} className="text-center py-1 text-[10px] font-semibold text-green-600 uppercase tracking-wide">Relationships</th>
              {/* Deal Progress group */}
              <th colSpan={6} className="text-center py-1 text-[10px] font-semibold text-blue-600 uppercase tracking-wide">Deal Progress</th>
              <th></th>
            </tr>
            <tr className="border-b border-gray-100">
              <th className="w-6"></th>
              <th className="text-left py-1 px-3"></th>
              <th className="text-center py-1 px-2 text-gray-400 font-normal">Texts</th>
              <th className="text-center py-1 px-2 text-gray-400 font-normal">Emails</th>
              <th className="text-center py-1 px-2 text-gray-400 font-normal">Calls</th>
              <th className="text-center py-1 px-2 text-gray-400 font-normal">New</th>
              <th className="text-center py-1 px-2 text-gray-400 font-normal">Upgr.</th>
              <th className="text-center py-1 px-2 text-gray-400 font-normal">New</th>
              <th className="text-center py-1 px-2 text-gray-400 font-normal">Reopen</th>
              <th className="text-center py-1 px-2 text-gray-400 font-normal">R/N</th>
              <th className="text-center py-1 px-2 text-gray-400 font-normal">Offers</th>
              <th className="text-center py-1 px-2 text-gray-400 font-normal">Negot.</th>
              <th className="text-center py-1 px-2 text-gray-400 font-normal">Accept.</th>
              <th className="text-center py-1 px-2 text-gray-400 font-normal">Acq.</th>
              <th className="text-center py-1 px-2 text-gray-400 font-normal">Time</th>
            </tr>
          </thead>
          <tbody>
            {teamData.map((row, i) => (
              <tr key={i} className={`border-b border-gray-100 last:border-0 ${row.highlighted ? "bg-yellow-50" : "hover:bg-gray-50"}`}>
                <td className="text-center py-2 px-1 text-gray-400 text-[10px] w-6">
                  {row.rank && typeof row.rank === "number" ? (
                    <span className="text-orange-500 font-semibold">{row.rank}</span>
                  ) : row.rank ? (
                    <span className="text-gray-400">{row.rank}</span>
                  ) : null}
                </td>
                <td className="py-2 px-3">
                  <span className={row.isYou ? "text-orange-500 font-medium" : "text-gray-700"}>
                    {row.name}{row.isYou ? " (You)" : ""}
                  </span>
                </td>
                <td className="text-center py-2 px-2 text-gray-700">{row.texts}</td>
                <td className="text-center py-2 px-2 text-gray-700">{row.emails}</td>
                <td className="text-center py-2 px-2 text-gray-700">{row.calls}</td>
                <td className="text-center py-2 px-2 text-gray-700">{row.newRel}</td>
                <td className="text-center py-2 px-2 text-gray-700">{row.upgr}</td>
                <td className="text-center py-2 px-2 text-gray-700">{row.new}</td>
                <td className="text-center py-2 px-2 text-gray-700">{row.reopen}</td>
                <td className="text-center py-2 px-2 text-gray-700">{row.ratio}</td>
                <td className="text-center py-2 px-2 text-gray-700">{row.offers}</td>
                <td className="text-center py-2 px-2 text-gray-700">{row.negot}</td>
                <td className="text-center py-2 px-2 text-gray-700">{row.accept}</td>
                <td className="text-center py-2 px-2 text-gray-700">{row.acq}</td>
                <td className="text-center py-2 px-2 text-gray-500">{row.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
