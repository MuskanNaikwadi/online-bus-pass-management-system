import { useEffect, useState } from "react";
import axios from "axios";
function Stats() {
  const [stats, setStats] = useState({
    totalPasses: 0,
    activePasses: 0,
    pendingPasses: 0,
    rejectedPasses: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(
        "${process.env.REACT_APP_API_URL}/api/buspass/stats"
      );


      setStats(res.data.data);

    } catch (error) {
      console.log(error);
    }
  };

  
  return (
    <section className="stats">

      <div className="stat-card">
        <h2>{stats.totalPasses}</h2>
        <p>Digital Passes Issued</p>
      </div>

      <div className="stat-card">
        <h2>{stats.activePasses}</h2>
        <p>Bus Routes Covered</p>
      </div>

      <div className="stat-card">
        <h2>{stats.pendingPasses}</h2>
        <p>System Uptime</p>
      </div>

      <div className="stat-card">
        <h2>{stats.rejectedPasses}</h2>
        <p>Safety Monitoring</p>
      </div>

    </section>
  );
}

export default Stats;