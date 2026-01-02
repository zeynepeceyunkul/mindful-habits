import { useEffect } from "react";
import api from "../services/api";

export default function Home() {
  useEffect(() => {
    api.get("/")
      .then(res => {
        console.log("API cevap verdi:", res.data);
      })
      .catch(() => {
  console.log("API yok ama bağlantı çalışıyor");
});

  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">
        Ana Sayfa
      </h2>
      <p className="text-gray-300">
        API altyapısı hazır 🚀
      </p>
    </div>
  );
}
