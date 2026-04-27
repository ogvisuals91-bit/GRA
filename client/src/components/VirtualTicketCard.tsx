export interface TicketCardData {
  username: string;
  ticketType: string;
  code: string;
  quantity?: number;
}

export function VirtualTicketCard({ data, cardId }: { data: TicketCardData; cardId?: string }) {
  const { username, ticketType, code, quantity = 1 } = data;

  return (
    <div
      id={cardId}
      style={{
        width: "620px",
        height: "300px",
        position: "relative",
        borderRadius: "20px",
        overflow: "hidden",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        flexShrink: 0,
      }}
    >
      {/* Deep background */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, #0a0020 0%, #130028 40%, #0d001a 70%, #050010 100%)",
      }} />

      {/* Subtle purple glow blobs */}
      <div style={{
        position: "absolute", top: "-60px", right: "-40px",
        width: "220px", height: "220px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(147,51,234,0.25) 0%, transparent 70%)",
      }} />
      <div style={{
        position: "absolute", bottom: "-50px", left: "-30px",
        width: "180px", height: "180px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(214,175,77,0.15) 0%, transparent 70%)",
      }} />

      {/* Glass card layer */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(214,175,77,0.25)",
        borderRadius: "20px",
      }} />

      {/* Gold top accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "3px",
        background: "linear-gradient(90deg, transparent, #D4AF37, #F4D03F, #D4AF37, transparent)",
      }} />

      {/* Vertical divider */}
      <div style={{
        position: "absolute", right: "200px", top: "20px", bottom: "20px", width: "1px",
        background: "linear-gradient(to bottom, transparent, rgba(214,175,77,0.3), transparent)",
      }} />

      {/* Notch left */}
      <div style={{
        position: "absolute", right: "192px", top: "50%", transform: "translateY(-50%)",
        width: "16px", height: "16px", borderRadius: "50%",
        background: "rgba(147,51,234,0.4)",
        border: "1px solid rgba(214,175,77,0.3)",
      }} />

      {/* LEFT SIDE — Main info */}
      <div style={{
        position: "absolute", left: "28px", top: "22px", right: "210px", bottom: "22px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        {/* Top: Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "22px", height: "22px", borderRadius: "6px",
            background: "linear-gradient(135deg, #D4AF37, #F4D03F)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: "11px", fontWeight: "900", color: "#0a0020" }}>G</span>
          </div>
          <span style={{
            fontSize: "11px", fontWeight: "700", letterSpacing: "0.25em", textTransform: "uppercase",
            color: "#D4AF37",
          }}>GHOST RAVE & AWARDS 2026</span>
        </div>

        {/* Middle: Ticket type */}
        <div>
          <div style={{
            fontSize: "9px", fontWeight: "700", letterSpacing: "0.2em", textTransform: "uppercase",
            color: "rgba(214,175,77,0.6)", marginBottom: "4px",
          }}>
            TICKET TYPE
          </div>
          <div style={{
            fontSize: "26px", fontWeight: "800", lineHeight: 1.1,
            color: "#ffffff",
            letterSpacing: "-0.02em",
          }}>
            {ticketType}
          </div>
          {quantity > 1 && (
            <div style={{
              marginTop: "4px", fontSize: "11px", fontWeight: "600",
              color: "rgba(214,175,77,0.8)",
            }}>
              ×{quantity} TICKETS
            </div>
          )}
        </div>

        {/* Bottom: Attendee */}
        <div>
          <div style={{
            fontSize: "9px", fontWeight: "700", letterSpacing: "0.18em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)", marginBottom: "3px",
          }}>
            ATTENDEE
          </div>
          <div style={{
            fontSize: "17px", fontWeight: "700", color: "#ffffff", letterSpacing: "0.02em",
          }}>
            @{username}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE — Code & decorative */}
      <div style={{
        position: "absolute", right: "0", top: "0", width: "200px", bottom: "0",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between",
        padding: "24px 20px",
      }}>
        {/* Stars decoration */}
        <div style={{ display: "flex", gap: "5px" }}>
          {[0.4, 0.8, 1, 0.8, 0.4].map((o, i) => (
            <div key={i} style={{
              width: "5px", height: "5px", borderRadius: "50%",
              background: `rgba(214,175,77,${o})`,
            }} />
          ))}
        </div>

        {/* Code box */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: "8px", fontWeight: "700", letterSpacing: "0.2em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)", marginBottom: "8px",
          }}>
            TICKET CODE
          </div>
          <div style={{
            background: "rgba(214,175,77,0.08)",
            border: "1px solid rgba(214,175,77,0.25)",
            borderRadius: "10px",
            padding: "10px 12px",
          }}>
            <div style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "14px", fontWeight: "800",
              color: "#D4AF37", letterSpacing: "0.12em",
              lineHeight: 1.5,
              textAlign: "center",
            }}>
              {code.split("-").map((part, i) => (
                <div key={i}>{part}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Barcode-like decoration */}
        <div style={{ display: "flex", gap: "2.5px", alignItems: "flex-end" }}>
          {[10, 16, 10, 20, 8, 14, 10, 18, 10, 12, 16, 8, 14, 10, 20].map((h, i) => (
            <div key={i} style={{
              width: "3px", height: `${h}px`, borderRadius: "1px",
              background: `rgba(214,175,77,${i % 3 === 0 ? 0.7 : i % 2 === 0 ? 0.4 : 0.25})`,
            }} />
          ))}
        </div>
      </div>

      {/* Bottom gold line */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "2px",
        background: "linear-gradient(90deg, transparent, rgba(214,175,77,0.4), transparent)",
      }} />
    </div>
  );
}

export function generateTicketCode(purchaseId: number, username: string): string {
  const idPart = String(purchaseId).padStart(4, "0");
  const userPart = username.slice(0, 3).toUpperCase().padEnd(3, "X");
  const year = "26";
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `GRA${year}-${idPart}-${userPart}${rand}`;
}
