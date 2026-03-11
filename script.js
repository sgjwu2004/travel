const geoData = {
  countries: [
    {
      id: "japan",
      name: "日本",
      center: [36.2, 138.3],
      zoom: 5,
      description: "日本由多个岛屿组成，四季分明，以传统文化、动漫与现代城市景观闻名。",
      cities: [
        {
          id: "tokyo",
          name: "东京",
          center: [35.6762, 139.6503],
          zoom: 11,
          description: "东京是日本首都，融合现代建筑、购物、美食与历史寺庙。",
          spots: [
            { id: "asakusa", name: "浅草寺", coord: [35.7148, 139.7967], description: "东京最具代表性的历史寺庙之一。" },
            { id: "shibuya", name: "涩谷十字路口", coord: [35.6595, 139.7005], description: "世界知名的人流十字路口，商业和潮流中心。" },
            { id: "tokyoTower", name: "东京塔", coord: [35.6586, 139.7454], description: "东京地标建筑，可俯瞰城市景观。" }
          ]
        },
        {
          id: "osaka",
          name: "大阪",
          center: [34.6937, 135.5023],
          zoom: 12,
          description: "大阪以美食、夜生活和热情氛围著称。",
          spots: [
            { id: "dotonbori", name: "道顿堀", coord: [34.6687, 135.5023], description: "霓虹闪烁的美食街区。" },
            { id: "osakaCastle", name: "大阪城", coord: [34.6873, 135.5262], description: "日本战国历史名城。" },
            { id: "umeda", name: "梅田蓝天大厦", coord: [34.7055, 135.4909], description: "观景台可眺望大阪全景。" }
          ]
        }
      ]
    },
    {
      id: "france",
      name: "法国",
      center: [46.2276, 2.2137],
      zoom: 5,
      description: "法国以艺术、葡萄酒、历史建筑和浪漫城市闻名。",
      cities: [
        {
          id: "paris",
          name: "巴黎",
          center: [48.8566, 2.3522],
          zoom: 12,
          description: "巴黎是法国首都，拥有众多博物馆与历史地标。",
          spots: [
            { id: "eiffel", name: "埃菲尔铁塔", coord: [48.8584, 2.2945], description: "巴黎地标，夜景迷人。" },
            { id: "louvre", name: "卢浮宫", coord: [48.8606, 2.3376], description: "世界级艺术博物馆。" },
            { id: "notreDame", name: "巴黎圣母院", coord: [48.853, 2.3499], description: "哥特式建筑代表作。" }
          ]
        }
      ]
    }
  ]
};

const detailCard = document.getElementById("detailCard");
const pinList = document.getElementById("pinList");
const routePlans = document.getElementById("routePlans");

const map = L.map("map", { zoomControl: true }).setView([25, 10], 2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const countryLayer = L.layerGroup().addTo(map);
const cityLayer = L.layerGroup().addTo(map);
const spotLayer = L.layerGroup().addTo(map);
const pinLayer = L.layerGroup().addTo(map);
const routeLineLayer = L.layerGroup().addTo(map);

const selectedPins = [];

const icons = {
  country: makeCircleIcon("#2563eb"),
  city: makeCircleIcon("#059669"),
  spot: makeCircleIcon("#f59e0b"),
  pin: makeCircleIcon("#dc2626")
};

function makeCircleIcon(color) {
  return L.divIcon({
    className: "",
    html: `<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.2);"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
}

function setDetail(title, desc, extra = "") {
  detailCard.innerHTML = `<h3>${title}</h3><p>${desc}</p>${extra}`;
}

function renderCountries() {
  countryLayer.clearLayers();
  cityLayer.clearLayers();
  spotLayer.clearLayers();

  geoData.countries.forEach((country) => {
    const marker = L.marker(country.center, { icon: icons.country }).addTo(countryLayer);
    marker.bindTooltip(`国家：${country.name}`);
    marker.on("click", () => {
      map.flyTo(country.center, country.zoom, { duration: 0.6 });
      setDetail(country.name, country.description, `<p><strong>城市数量：</strong>${country.cities.length}</p>`);
      renderCities(country);
    });
  });
}

function renderCities(country) {
  cityLayer.clearLayers();
  spotLayer.clearLayers();

  country.cities.forEach((city) => {
    const marker = L.marker(city.center, { icon: icons.city }).addTo(cityLayer);
    marker.bindTooltip(`城市：${city.name}`);
    marker.on("click", () => {
      map.flyTo(city.center, city.zoom, { duration: 0.6 });
      setDetail(city.name, city.description, `<p><strong>景点数量：</strong>${city.spots.length}</p>`);
      renderSpots(city);
    });
  });
}

function renderSpots(city) {
  spotLayer.clearLayers();

  city.spots.forEach((spot) => {
    const marker = L.marker(spot.coord, { icon: icons.spot }).addTo(spotLayer);
    marker.bindTooltip(`景点：${spot.name}`);
    marker.on("click", () => {
      addPin(spot.name, spot.coord, spot.description, city.name);
      map.flyTo(spot.coord, 14, { duration: 0.4 });
      setDetail(spot.name, spot.description, `<p><strong>所在城市：</strong>${city.name}</p>`);
    });
  });
}

function addPin(name, coord, description = "自定义钉子", parentName = "自定义") {
  const marker = L.marker(coord, { icon: icons.pin }).addTo(pinLayer);
  marker.bindPopup(`<strong>${name}</strong><br/>${description}`);

  const pin = {
    id: `${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    coord,
    description,
    parentName,
    marker
  };

  selectedPins.push(pin);
  renderPinList();
  generateRoutes();
}

function renderPinList() {
  pinList.innerHTML = "";

  if (!selectedPins.length) {
    pinList.innerHTML = "<li>尚未放置钉子</li>";
    return;
  }

  selectedPins.forEach((pin, index) => {
    const li = document.createElement("li");
    li.innerHTML = `${index + 1}. <strong>${pin.name}</strong>（${pin.parentName}）`;
    pinList.appendChild(li);
  });
}

function generateRoutes() {
  routeLineLayer.clearLayers();

  if (selectedPins.length < 2) {
    routePlans.classList.add("muted");
    routePlans.innerHTML = "<p>放置至少 2 个景点钉子后，会在此生成路线。</p>";
    return;
  }

  const shortestPath = nearestNeighborPath(selectedPins);
  const reversePath = [...shortestPath].reverse();
  const scenicPath = [...selectedPins].sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN"));

  drawPath(shortestPath, "#dc2626");

  const plans = [
    { name: "时间最少（贪心近邻）", path: shortestPath },
    { name: "反向路线（便于返程）", path: reversePath },
    { name: "字母顺序打卡线（轻松浏览）", path: scenicPath }
  ];

  routePlans.classList.remove("muted");
  routePlans.innerHTML = plans
    .map((plan, i) => {
      const distance = calcPathDistance(plan.path).toFixed(1);
      const stops = plan.path.map((p) => p.name).join(" → ");
      return `
      <div class="route-item">
        <p><strong>方案 ${i + 1}：${plan.name}</strong></p>
        <p>${stops}</p>
        <p>预计总距离：${distance} km</p>
      </div>`;
    })
    .join("");
}

function drawPath(path, color) {
  const latlngs = path.map((p) => p.coord);
  L.polyline(latlngs, { color, weight: 4, opacity: 0.8 }).addTo(routeLineLayer);
}

function nearestNeighborPath(points) {
  const remaining = [...points];
  const path = [remaining.shift()];

  while (remaining.length) {
    const current = path[path.length - 1];
    let nearestIdx = 0;
    let minDist = Infinity;

    remaining.forEach((pt, idx) => {
      const dist = haversine(current.coord, pt.coord);
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = idx;
      }
    });

    path.push(remaining.splice(nearestIdx, 1)[0]);
  }

  return path;
}

function calcPathDistance(path) {
  let total = 0;
  for (let i = 0; i < path.length - 1; i += 1) {
    total += haversine(path[i].coord, path[i + 1].coord);
  }
  return total;
}

function haversine([lat1, lon1], [lat2, lon2]) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

map.on("click", (evt) => {
  const { lat, lng } = evt.latlng;
  const customName = `自定义点 ${selectedPins.length + 1}`;
  addPin(customName, [lat, lng], "用户在地图上手动放置的钉子", "自定义位置");
  setDetail(customName, `坐标：${lat.toFixed(4)}, ${lng.toFixed(4)}`);
});

document.getElementById("clearPinsBtn").addEventListener("click", () => {
  selectedPins.length = 0;
  pinLayer.clearLayers();
  routeLineLayer.clearLayers();
  renderPinList();
  generateRoutes();
  setDetail("已清空钉子", "你可以重新选择国家、城市和景点，或在地图空白处点击添加自定义钉子。");
});

document.getElementById("resetViewBtn").addEventListener("click", () => {
  map.flyTo([25, 10], 2, { duration: 0.6 });
  renderCountries();
  setDetail("地图已重置", "国家标记已恢复，请重新开始探索。");
});

renderCountries();
renderPinList();
generateRoutes();
