import trophyImageUrl from "@assets/file_00000000bb407243b272e093da6604ab_1774341911146.png";

export function TrophyCube3D() {
  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes trophy-spin {
          0%   { transform: rotateY(0deg) translateY(0px); }
          25%  { transform: rotateY(90deg) translateY(-8px); }
          50%  { transform: rotateY(180deg) translateY(0px); }
          75%  { transform: rotateY(270deg) translateY(-8px); }
          100% { transform: rotateY(360deg) translateY(0px); }
        }
        @keyframes trophy-glow {
          0%, 100% { filter: drop-shadow(0 0 18px rgba(255,215,0,0.7)) drop-shadow(0 0 40px rgba(168,85,247,0.3)); }
          50%       { filter: drop-shadow(0 0 30px rgba(255,215,0,1))   drop-shadow(0 0 60px rgba(168,85,247,0.5)); }
        }
        @keyframes particle-float {
          0%   { transform: translateY(0px) translateX(0px); opacity: 0.8; }
          50%  { transform: translateY(-20px) translateX(10px); opacity: 0.3; }
          100% { transform: translateY(0px) translateX(0px); opacity: 0.8; }
        }
        .trophy-spin {
          animation: trophy-spin 4s linear infinite, trophy-glow 2.5s ease-in-out infinite;
          transform-style: preserve-3d;
        }
        .particle { animation: particle-float linear infinite; position: absolute; border-radius: 50%; background: #ffd700; pointer-events: none; }
      `}</style>

      <div className="relative" style={{ perspective: "800px" }}>
        {/* Floating gold particles */}
        {[
          { w: 4, h: 4, top: "10%",  left: "5%",  dur: "2.1s", delay: "0s"    },
          { w: 3, h: 3, top: "20%",  left: "90%", dur: "1.8s", delay: "0.4s"  },
          { w: 5, h: 5, top: "70%",  left: "8%",  dur: "2.6s", delay: "0.7s"  },
          { w: 3, h: 3, top: "80%",  left: "85%", dur: "2.0s", delay: "1.1s"  },
          { w: 4, h: 4, top: "50%",  left: "2%",  dur: "2.4s", delay: "0.2s"  },
          { w: 3, h: 3, top: "40%",  left: "93%", dur: "1.9s", delay: "0.9s"  },
          { w: 5, h: 5, top: "5%",   left: "50%", dur: "2.2s", delay: "0.5s"  },
          { w: 3, h: 3, top: "90%",  left: "50%", dur: "2.7s", delay: "1.3s"  },
        ].map((p, i) => (
          <span
            key={i}
            className="particle"
            style={{
              width: p.w, height: p.h,
              top: p.top, left: p.left,
              animationDuration: p.dur,
              animationDelay: p.delay,
            }}
          />
        ))}

        {/* Spinning trophy image */}
        <img
          src={trophyImageUrl}
          alt="Ghost Award Trophy"
          className="trophy-spin"
          style={{
            width: "min(280px, 70vw)",
            height: "auto",
            transformOrigin: "center center",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}
