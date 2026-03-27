import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { XMLParser } from "fast-xml-parser";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });

  app.use(express.text({ type: "application/xml" }));
  app.use(express.json());

  // Endpoint para receber o feed real do ODF (POST via HTTP)
  app.post("/api/odf/feed", (req, res) => {
    const xmlData = req.body;
    try {
      const jsonObj = parser.parse(xmlData);
      console.log("Received ODF Message:", jsonObj.OdfBody?.DocumentType);
      
      // Broadcast para o frontend via WebSocket
      io.emit("odf_message", {
        raw: xmlData,
        parsed: jsonObj,
        timestamp: new Date().toISOString(),
      });

      res.status(200).send("Message received");
    } catch (error) {
      console.error("Error parsing ODF XML:", error);
      res.status(400).send("Invalid XML");
    }
  });

  // Simulação de mensagens para o protótipo
  app.post("/api/simulate", (req, res) => {
    const { type } = req.body;
    let mockXml = "";

    if (type === "DT_SCHEDULE") {
      mockXml = `<?xml version="1.0" encoding="UTF-8"?>
<OdfBody DocumentType="DT_SCHEDULE" CompetitionCode="OG2026">
  <Competition>
    <Unit Code="SWMW100MFREEL----------FNL-000100--" ScheduleStatus="GETTING_READY" StartDate="${new Date().toISOString()}" Sport="SWM">
      <ItemName Language="ENG" Value="Women's 100m Freestyle Final"/>
      <VenueDescription VenueName="Aquatics Centre" LocationName="Pool A"/>
      <Competitor Code="BRA01" Type="A" Organisation="BRA">
        <Description FamilyName="SILVA" GivenName="Maria"/>
      </Competitor>
    </Unit>
    <Unit Code="BKBWTEAM5-------------GPA-000100--" ScheduleStatus="SCHEDULED" StartDate="${new Date(Date.now() + 3600000).toISOString()}" Sport="BKB">
      <ItemName Language="ENG" Value="Women's Basketball: BRA vs USA"/>
      <VenueDescription VenueName="Arena Carioca 1" LocationName="Court 1"/>
      <Competitor Code="BRA_TEAM" Type="T" Organisation="BRA">
        <Description TeamName="Brazil"/>
      </Competitor>
      <Competitor Code="USA_TEAM" Type="T" Organisation="USA">
        <Description TeamName="United States"/>
      </Competitor>
    </Unit>
    <Unit Code="JUDW52KG--------------FNL-000100--" ScheduleStatus="SCHEDULED" StartDate="${new Date(Date.now() + 7200000).toISOString()}" Sport="JUD">
      <ItemName Language="ENG" Value="Women -52kg Final"/>
      <VenueDescription VenueName="Champ-de-Mars Arena" LocationName="Mat 1"/>
      <Competitor Code="BRA04" Type="A" Organisation="BRA">
        <Description FamilyName="KELMENDI" GivenName="Majlinda"/>
      </Competitor>
    </Unit>
  </Competition>
</OdfBody>`;
    } else if (type === "DT_RESULT") {
      mockXml = `<?xml version="1.0" encoding="UTF-8"?>
<OdfBody DocumentType="DT_RESULT" ResultStatus="LIVE" CompetitionCode="OG2026">
  <Competition>
    <Unit Code="SWMW100MFREEL----------FNL-000100--" Sport="SWM">
      <ItemName Language="ENG" Value="Women's 100m Freestyle Final"/>
      <VenueDescription VenueName="Aquatics Centre" LocationName="Pool A"/>
      <Result Rank="1" SortOrder="1" ResultType="TIME" ResultValue="52.12">
        <Competitor Code="BRA01" Type="A" Organisation="BRA">
          <Description FamilyName="SILVA" GivenName="Maria"/>
        </Competitor>
        <ExtendedResults>
          <ExtendedResult Code="PB" Value="YES"/>
        </ExtendedResults>
      </Result>
      <Result Rank="2" SortOrder="2" ResultType="TIME" ResultValue="52.45">
        <Competitor Code="USA01" Type="A" Organisation="USA">
          <Description FamilyName="SMITH" GivenName="Jane"/>
        </Competitor>
      </Result>
      <Result Rank="3" SortOrder="3" ResultType="TIME" ResultValue="52.88">
        <Competitor Code="AUS01" Type="A" Organisation="AUS">
          <Description FamilyName="LEE" GivenName="Sarah"/>
        </Competitor>
      </Result>
      <Result Rank="4" SortOrder="4" ResultType="TIME" ResultValue="53.10">
        <Competitor Code="BRA02" Type="A" Organisation="BRA">
          <Description FamilyName="SANTOS" GivenName="Ana"/>
        </Competitor>
        <ExtendedResults>
          <ExtendedResult Code="SB" Value="YES"/>
        </ExtendedResults>
      </Result>
    </Unit>
    <Unit Code="ATHM100M--------------FNL-000100--" Sport="ATH">
      <ItemName Language="ENG" Value="Men's 100m Final"/>
      <VenueDescription VenueName="Olympic Stadium" LocationName="Track"/>
      <Result Rank="1" SortOrder="1" ResultType="TIME" ResultValue="9.82">
        <Competitor Code="JAM01" Type="A" Organisation="JAM">
          <Description FamilyName="BOLT" GivenName="Junior"/>
        </Competitor>
      </Result>
      <Result Rank="5" SortOrder="5" ResultType="TIME" ResultValue="10.02">
        <Competitor Code="BRA03" Type="A" Organisation="BRA">
          <Description FamilyName="LIMA" GivenName="Paulo"/>
        </Competitor>
      </Result>
    </Unit>
  </Competition>
</OdfBody>`;
    } else if (type === "DT_MEDALS") {
      mockXml = `<?xml version="1.0" encoding="UTF-8"?>
<OdfBody DocumentType="DT_MEDALS" CompetitionCode="OG2026">
  <MedalStandings>
    <MedalsTable>
      <MedalLine Rank="1" Organisation="USA">
        <Description OrganisationName="United States of America"/>
        <MedalNumber Type="TOT" Gold="12" Silver="8" Bronze="10" Total="30"/>
      </MedalLine>
      <MedalLine Rank="2" Organisation="CHN">
        <Description OrganisationName="People's Republic of China"/>
        <MedalNumber Type="TOT" Gold="10" Silver="11" Bronze="5" Total="26"/>
      </MedalLine>
      <MedalLine Rank="3" Organisation="BRA">
        <Description OrganisationName="Brazil"/>
        <MedalNumber Type="TOT" Gold="5" Silver="3" Bronze="4" Total="12"/>
      </MedalLine>
    </MedalsTable>
  </MedalStandings>
</OdfBody>`;
    } else if (type === "DT_VEN_COND") {
      mockXml = `<?xml version="1.0" encoding="UTF-8"?>
<OdfBody DocumentType="DT_VEN_COND" CompetitionCode="OG2026">
  <Venue Code="AQC">
    <DateTime Date="2026-03-27" Time="15:00" Code="TIME">
      <Conditions Code="GEN" Humidity="45" Wind_Direction="NE">
        <Condition Code="SKY" Value="Sunny"/>
        <Temperature Code="AIR" Unit="C" Value="28.5" Type="NOR"/>
      </Conditions>
    </DateTime>
  </Venue>
</OdfBody>`;
    }

    if (mockXml) {
      const jsonObj = parser.parse(mockXml);
      io.emit("odf_message", {
        raw: mockXml,
        parsed: jsonObj,
        timestamp: new Date().toISOString(),
      });
      return res.json({ status: "Simulated", type });
    }
    res.status(400).json({ error: "Unknown simulation type" });
  });

  // Vite middleware para desenvolvimento
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
