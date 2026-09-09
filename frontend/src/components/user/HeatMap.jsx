import { useEffect, useState, useMemo } from "react";
import HeatMap from "@uiw/react-heat-map";

const HeatMapProfile = () => {
    const [activityData, setActivityData] = useState([]);
    const [totalContributions, setTotalContributions] = useState(0);

    // Generate dynamic activity for the past 5 months up to today
    useEffect(() => {
        const today = new Date();
        const start = new Date();
        start.setMonth(today.getMonth() - 5);
        start.setDate(1);

        const data = [];
        let cur = new Date(start);
        let total = 0;

        while (cur <= today) {
            // Realistic dev contribution distribution
            const hasActivity = Math.random() > 0.45;
            const count = hasActivity ? Math.floor(Math.random() * 8) + 1 : 0;
            total += count;

            data.push({
                date: cur.toISOString().split("T")[0],
                count,
            });
            cur.setDate(cur.getDate() + 1);
        }

        setActivityData(data);
        setTotalContributions(total);
    }, []);

    // Color panel matching NexCode dark/indigo/cyan theme
    const panelColors = useMemo(() => {
        return {
            0: "#131a2b", // empty tile recessed
            1: "#2e3856",
            2: "#37426b",
            3: "#4f46e5",
            4: "#6366f1",
            5: "#818cf8",
            6: "#a5b4fc",
            7: "#38bdf8",
            8: "#0ea5e9",
        };
    }, []);

    const startDate = useMemo(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 5);
        d.setDate(1);
        return d;
    }, []);

    const endDate = useMemo(() => new Date(), []);

    return (
        <div className="heatmap-container">
            <div className="heatmap-header">
                <div className="heatmap-title-wrap">
                    <h4>Contribution Activity</h4>
                    <span className="heatmap-total-badge">
                        {totalContributions} contributions in the last 5 months
                    </span>
                </div>

                <div className="heatmap-legend">
                    <span>Less</span>
                    <span className="legend-cell" style={{ background: "#131a2b" }} />
                    <span className="legend-cell" style={{ background: "#37426b" }} />
                    <span className="legend-cell" style={{ background: "#6366f1" }} />
                    <span className="legend-cell" style={{ background: "#818cf8" }} />
                    <span className="legend-cell" style={{ background: "#38bdf8" }} />
                    <span>More</span>
                </div>
            </div>

            <div className="heatmap-scroll-area">
                <HeatMap
                    value={activityData}
                    startDate={startDate}
                    endDate={endDate}
                    weekLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
                    rectSize={13}
                    space={3}
                    rectProps={{
                        rx: 3,
                    }}
                    panelColors={panelColors}
                    style={{ color: "#94a3b8" }}
                />
            </div>
        </div>
    );
};

export default HeatMapProfile;
