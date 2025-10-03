import React, { useEffect, useState } from "react";
import API_BASE from '../lib/api_endpoint';

export default function Leaderboard({ currentUserId, token}) {
  const [teams, setTeams] = useState([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        let url = `${API_BASE}/leaderboard`;
        const headers = {};

        if (currentUserId && token) {
          url = `${API_BASE}/leaderboard/current`; 
          headers.Authorization = `Bearer ${token}`;
        }
        const res = await fetch(url, { headers });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch leaderboard");

        // Extract leaderboard array and current user index
        const leaderboard = Array.isArray(data.leaderboard) ? data.leaderboard : data;
        setTeams(leaderboard);
        if (data.currentUserIndex !== undefined) setCurrentUserIndex(data.currentUserIndex);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [currentUserId, token]);

  if (loading) {
    return <p className="text-center text-white mt-20">Loading leaderboard...</p>;
  }

  return (
    <div className="min-h-screen pt-15 bg-[#0D1A2B] text-white">
      <div className="max-w-screen-xl mx-auto px-4">
        {/* Stats Section */}
        <div className="flex flex-wrap justify-center gap-8 mt-10">
          <div className="bg-[#111C33] flex items-center gap-4 px-6 py-4 rounded-lg shadow-lg w-full sm:w-auto">
            <div className="w-18 h-18 bg-black rounded-lg" />
            <div>
              <h3 className="text-cyan-400 text-sm font-semibold">ACTIVE RETARDS</h3>
              <p className="text-2xl md:text-3xl font-bold">{teams.length}</p>
            </div>
          </div>
          <div className="bg-[#111C33] flex items-center gap-4 px-6 py-4 rounded-lg shadow-lg w-full sm:w-auto">
            <div className="w-18 h-18 bg-black rounded-lg" />
            <div>
              <h3 className="text-cyan-400 text-sm font-semibold">TOTAL POOL</h3>
              <p className="text-2xl md:text-3xl font-bold">
                {teams.reduce((acc, t) => acc + (t.points ?? 0), 0)}
              </p>
            </div>
          </div>
          <div className="bg-[#111C33] flex items-center gap-4 px-6 py-4 rounded-lg shadow-lg w-full sm:w-auto">
            <div className="w-18 h-18 bg-black rounded-lg" />
            <div>
              <h3 className="text-cyan-400 text-sm font-semibold">CURRENT RANK</h3>
              <p className="text-2xl md:text-3xl font-bold">
                {currentUserIndex !== null ? `#${currentUserIndex + 1}` : "#N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-[#111C33] mt-8 p-6 sm:p-8 md:p-10 rounded-2xl">
          {/* Team Avatars */}
          <div className="flex flex-wrap justify-center gap-10 md:gap-20 mb-10">
  {teams.slice(0, 3).map((team, idx) => {
    // Assign medal colors
    const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"]; // Gold, Silver, Bronze
    return (
      <div key={team._id || idx} className="text-center">
        <div
          className="w-24 h-24 md:w-28 md:h-28 rounded-full mx-auto border-4 border-gray-700 overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: medalColors[idx] }}
        >
          {/* You can put a team logo or initials inside if you want */}
          <span className="text-black font-bold text-lg">{team.teamId || "T"}</span>
        </div>
        <h4 className="mt-3 text-base sm:text-lg font-semibold">
  {team.teamLeader?.name}
  {team.player2?.name ? `, ${team.player2.name}` : ""}
</h4>

        <p className="text-gray-300 text-sm sm:text-base">
          {team.points ?? 0} pts
        </p>
      </div>
    );
  })}
</div>

{/* Leaderboard Table */}
<div className="w-full overflow-x-auto">
  <div className="min-w-[300px]">
    {/* Header */}
    <div className="grid grid-cols-4 gap-4 px-4 sm:px-6 py-3 border-b border-gray-700 text-cyan-300 font-semibold text-sm sm:text-base">
      <span>RANK</span>
      <span>TEAM ID</span>
      <span>TEAM MEMBERS</span>
      <span className="text-right">POINTS</span>
    </div>

    {/* Rows */}
    {teams.map((team, idx) => (
      <div
        key={team._id || idx}
        className={`grid grid-cols-4 gap-4 px-4 sm:px-6 py-4 border-b border-gray-800 transition items-center ${
          idx === currentUserIndex ? "bg-[#134273]" : "hover:bg-[#0E2038]"
        }`}
      >
        <span className="text-teal-300 font-semibold text-sm sm:text-base">
          {idx + 1}
        </span>
        <span className="font-bold text-sm sm:text-base">{team.teamId}</span>
        <div className="text-gray-300 text-sm sm:text-base">
          {team.teamLeader?.name}
          {team.player2?.name ? `, ${team.player2.name}` : ""}
        </div>
        <span className="text-cyan-400 font-semibold text-right text-sm sm:text-base">
          {team.points ?? 0}
        </span>
      </div>
    ))}
  </div>
</div>

        </div>
      </div>
    </div>
  );
}









