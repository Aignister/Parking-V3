# Backend

## db/pool.js 
Este crea y exporta una pool de conexiones de PostgreSQL reutilizable dentro de los todos los routers

    const pool = new Pool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_NAME || "parking_db",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "",
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

## server.js
Este configura el servidor de Express, asi mismo registra los Middlewares a utilizar asi como el registro de los 3 routers a utilziar

    const app = express();
    const PORT = process.env.PORT || 4000;
    
    app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"] }));
    app.use(express.json());
    
    app.use("/api/parkings", parkingsRouter);
    app.use("/api/logs", logsRouter);
    app.use("/api/stats", statsRouter);

## routes/parking.js
Este expone 2 endpoints para leer los estados del estacionamiento, el primero para listar todos los parking con espacios ocupados, 
y el segundo el tipo de parking 

GET /api/parkings 

    router.get("/", async (req, res) => {
      try {
        const { rows } = await pool.query(`
          SELECT p.id, p.name, p.description, p.total_spots, COUNT(ss.spot_code) FILTER (WHERE ss.is_occupied = TRUE) AS occupied_count
          FROM parkings p LEFT JOIN spot_states ss ON ss.parking_id = p.id GROUP BY p.id ORDER BY p.id
        `);
        res.json(rows);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
      }
    });

GET /api/parkings/:id/spots

    router.get("/:id/spots", async (req, res) => {
      const parkingId = parseInt(req.params.id);
      try {
        const { rows } = await pool.query(`
          SELECT s.spot_code, s.spot_type, COALESCE(ss.is_occupied, FALSE) AS is_occupied
          FROM spots s LEFT JOIN spot_states ss ON ss.parking_id = s.parking_id AND ss.spot_code = s.spot_code
          WHERE s.parking_id = $1 ORDER BY s.spot_code
        `, [parkingId]);
        res.json(rows);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
      }
    });


## routes/logs.js
Es el router encargado de realizar las transacciones de SQL de forma consistente, asi mismo, en caso de fallar un INSERT este realiza un ROLLBACK completo

La /api/logs con GET realiza el paginado del historial

Mientras que /api/logs con POST realiza los INSERT dentro de la base de datos de las entradas y salidas

## routes/stats.js

Genera estadisticas utilizando vistas, las cuales dan las estadisticas diarias, semanales y mensuales, asi como la utilizacion de generate_series() de PostgreSQL
para rellenar dias/semanas/meses sin activdad con ceros

Ejemplo de codigo para conseguir la estadisticas diarias:

    router.get("/daily", async (req, res) => {
      const days = parseInt(req.query.days || "7");
      try {
        const { rows } = await pool.query(`
          SELECT p.id AS parking_id, p.name AS parking_name, gs.day::date AS day, COALESCE(ds.entries, 0) AS entries, COALESCE(ds.exits, 0) AS exits
          FROM parkings p CROSS JOIN ( SELECT generate_series( NOW()::date - ($1 - 1) * INTERVAL '1 day', NOW()::date, '1 day' )::date AS day ) gs
          LEFT JOIN daily_stats ds ON ds.parking_id = p.id AND ds.day = gs.day ORDER BY gs.day, p.id
        `, [days]);
        res.json(rows);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
      }
    });

# Frontend

## App.jsx

Es el componente raiz, el cual gestiona l navegacion entre vistas, asi como mantener una sola instancia de useParkingState por parking

UseParkingState se instancia 3 veces, una vez por parking, el Header lee los stats de estas instancias y en base a esto crea el contador

    export default function App() {
      const [sidebarOpen, setSidebarOpen] = useState(false);
      const [activeItem,  setActiveItem]  = useState("mapa1");
    
      const p1 = useParkingState(PARKING_1_CONFIG);
      const p2 = useParkingState(PARKING_2_CONFIG);
      const p3 = useParkingState(PARKING_3_CONFIG);
    
      const PARKING_STATES = { mapa1: p1, mapa2: p2, mapa3: p3 };
    
      const stats = {
        totalSpots: p1.stats.totalSpots + p2.stats.totalSpots + p3.stats.totalSpots,
        occupiedCount: p1.stats.occupiedCount + p2.stats.occupiedCount + p3.stats.occupiedCount,
        freeCount: p1.stats.freeCount + p2.stats.freeCount + p3.stats.freeCount,
        disabledCount: p1.stats.disabledCount + p2.stats.disabledCount + p3.stats.disabledCount,
      };

## hooks/UseParkingState.js

Funciona comom un hook personalizado que centraliza toda la logica del estado de un parking, 
este exponje el estado de ocupacion, y funciones para consultarlo o modificarlo

    const isOccupied = useCallback(
      (spotId) => occupiedSpots.has(spotId),
      [occupiedSpots]
    );
  
    const toggleSpot = useCallback(
      (spotId) => {
        setOccupiedSpots((prev) => {
          const next = new Set(prev);
          const action = next.has(spotId) ? "exit" : "entry";
          action === "exit" ? next.delete(spotId) : next.add(spotId);
  
          logAccess(parkingId, spotId, action).catch(console.warn);
  
          return next;
        });
      },
      [parkingId]
    );

## services/api.js
Este es el servicio de comunicacion, donde se realiza el fetch(), y centraliza el URL base de VITE, y el manejo de erroes de HTTP, 
todos los componentes que necesitan datos del backend se importan desde aqui

    export const logAccess = (parkingId, spotCode, action) =>
      request("/api/logs", {
        method: "POST", 
        body: JSON.stringify({ parking_id: parkingId, spot_code: spotCode, action }),
      });
    
    export const fetchLogs = (parkingId, limit = 100, offset = 0) => {
      const q = new URLSearchParams({ limit, offset });
      if (parkingId) q.set("parking_id", parkingId);
      return request(`/api/logs?${q}`);
    };
    
    export const fetchDailyStats = (days = 7) => request(`/api/stats/daily?days=${days}`);
    export const fetchWeeklyStats = (weeks = 4) => request(`/api/stats/weekly?weeks=${weeks}`);
    export const fetchMonthlyStats = (months = 6) => request(`/api/stats/monthly?months=${months}`);
    export const fetchStatsSummary = () => request("/api/stats/summary");

## config/ParkingConfig.js
Define la estructura completa de los 3 parkings sin la uitilizacion de base de datos, el tipo de spots a tener, las zonas marcadas, la configuracion de cada parking

    export const PARKING_1_CONFIG = {
      id: 1,
      title:    "Parking 1",
      subtitle: "Estacionamiento Principal",
      zones: makeZones(
        ["A", "B", "C", "D"],
        ["Acceso Principal", "Pasillo Sur", "Ala Izquierda", "Ala Derecha"],
        [0]
      ),
    };
    
    export const PARKING_2_CONFIG = {
      id: 2,
      title: "Parking 2",
      subtitle: "Estacionamiento Norte",
      zones: makeZones(
        ["E", "F", "G", "H"],
        ["Entrada Norte", "Pasillo Central", "Ala Este", "Ala Oeste"],
        [1]
      ),
    };
    
    export const PARKING_3_CONFIG = {
      id: 3,
      title: "Parking 3",
      subtitle: "Estacionamiento Sur",
      zones: makeZones(
        ["I", "J", "K", "L"],
        ["Entrada Sur", "Pasillo Norte", "Ala Este", "Ala Oeste"],
        [2]
      ),
    };



