export const profileData = {
    name: "Muaz Hamza Leventoğlu",
    title: "Bilgisayar Mühendisliği Öğrencisi",
    subtitle: "Web geliştirme, Bilgisayarlı Görü ve Robotik alanlarında deneyimli mühendis adayı",
    bio: `İstanbul Üniversitesi-Cerrahpaşa'da 3. sınıf Bilgisayar Mühendisliği öğrencisiyim (GPA: 3.51). 

Web geliştirme (.NET, React), bilgisayarlı görü (YOLO, PyTorch, CNN) ve robotik (ROS2, Gazebo) alanlarında deneyim kazandım. 

Öğrenmeye açık, takım çalışmasına yatkın ve gelişen teknolojilere hızlı uyum sağlayan bir mühendis adayıyım. GökmenUAV öğrenci takımında aktif olarak çalışıyor ve Teknofest yarışmasına hazırlanıyorum.`,
    email: "mhleventoglu@gmail.com",
    phone: "0553 768 83 40",
    location: "İstanbul, Türkiye",
    university: "İstanbul Üniversitesi-Cerrahpaşa",
    degree: "Bilgisayar Mühendisliği Lisans",
    gradYear: "2027",
    gpa: "3.51",
    social: {
        github: "https://github.com/MHLeventoglu",
        linkedin: "https://www.linkedin.com/in/muazhamza-leventoğlu-860109249",
        website: "https://mhlev.com"
    },
    skills: [
        // Programming Languages
        { name: "Python", category: "Programlama", level: 90 },
        { name: "C#", category: "Programlama", level: 85 },
        { name: "C++", category: "Programlama", level: 80 },
        { name: "Java", category: "Programlama", level: 75 },
        { name: "TypeScript", category: "Programlama", level: 78 },
        { name: "JavaScript", category: "Programlama", level: 82 },
        // Web Development
        { name: ".NET", category: "Web", level: 85 },
        { name: "React", category: "Web", level: 80 },
        { name: "HTML/CSS", category: "Web", level: 88 },
        { name: "TailwindCSS", category: "Web", level: 75 },
        { name: "SQL", category: "Web", level: 78 },
        // AI/ML & Computer Vision
        { name: "YOLO", category: "Yapay Zeka", level: 88 },
        { name: "PyTorch", category: "Yapay Zeka", level: 82 },
        { name: "OpenCV", category: "Yapay Zeka", level: 85 },
        { name: "CNN", category: "Yapay Zeka", level: 80 },
        { name: "DETR & ViT", category: "Yapay Zeka", level: 75 },
        // Robotics
        { name: "ROS2 Humble", category: "Robotik", level: 85 },
        { name: "Gazebo Fortress", category: "Robotik", level: 80 },
        { name: "Nav2", category: "Robotik", level: 78 },
        { name: "SlamToolbox", category: "Robotik", level: 75 },
        { name: "Arduino", category: "Robotik", level: 82 },
        // Tools
        { name: "Git & GitHub", category: "Araçlar", level: 88 },
        { name: "Docker", category: "Araçlar", level: 78 },
        { name: "Linux", category: "Araçlar", level: 85 },
        { name: "W&B", category: "Araçlar", level: 72 }
    ]
}

export const sampleProjects = [
    {
        id: "1",
        title: "Otonom AMR Platformu",
        description: "ROS2, Rviz, GazeboFortress kullanarak 2D Lidar, RaspberryPi4, Arduino ve encoderli motorlar ile otonom mobil robot projesi geliştirdim. SLAM ve navigasyon sistemleri entegre edildi.",
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600",
        tags: ["ROS2", "Gazebo", "SLAM", "Nav2", "Arduino"],
        category: "Robotik",
        github: "https://github.com/MHLeventoglu",
        featured: true,
        createdAt: "2025-09-01"
    },
    {
        id: "2",
        title: "Teknofest Yapay Zeka - Nesne Tespiti",
        description: "GökmenUAV takımı ile Teknofest Havacılıkta Yapay Zeka yarışması için YOLO tabanlı insan, araç ve iniş alanı tespiti yapan nesne tespit modeli geliştirdim. Drone görüntüleri üzerinde çalışır.",
        image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600",
        tags: ["YOLO", "PyTorch", "Computer Vision", "Drone"],
        category: "Yapay Zeka",
        github: "https://github.com/MHLeventoglu",
        featured: true,
        createdAt: "2024-11-01"
    },
    {
        id: "3",
        title: "OrbSlam Görsel Lokalizasyon",
        description: "Drone görüntüleri için OrbSlam tabanlı görsel lokalizasyon ve haritalama sistemi. Teknofest yarışması kapsamında geliştirilen SLAM çözümü.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600",
        tags: ["SLAM", "Python", "OpenCV", "Localization"],
        category: "Yapay Zeka",
        github: "https://github.com/MHLeventoglu",
        featured: false,
        createdAt: "2024-12-01"
    },
    {
        id: "4",
        title: "Web Geliştirme Projeleri",
        description: ".NET ve React kullanarak çeşitli web uygulamaları geliştirdim. Full-stack geliştirme deneyimi ile modern web teknolojilerinde uzmanlaştım.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
        tags: [".NET", "React", "SQL", "TailwindCSS"],
        category: "Web",
        github: "https://github.com/MHLeventoglu",
        demo: "https://mhlev.com",
        featured: false,
        createdAt: "2024-06-01"
    }
]

export const samplePosts = [
    {
        id: "1",
        title: "ROS2 ile Otonom Robot Geliştirme",
        slug: "ros2-ile-otonom-robot-gelistirme",
        excerpt: "ROS2 Humble, Gazebo Fortress ve Nav2 kullanarak sıfırdan otonom mobil robot geliştirme rehberi. SLAM ve navigasyon sistemlerinin entegrasyonu.",
        content: `# ROS2 ile Otonom Robot Geliştirme

Bu yazıda, ROS2 Humble kullanarak nasıl otonom bir mobil robot geliştirebileceğinizi anlatacağım.

## Gerekli Bileşenler

### Donanım
- RaspberryPi 4
- 2D Lidar (örn: RPLidar A1)
- Encoderli DC Motorlar
- Arduino (motor sürücü olarak)
- IMU sensörü

### Yazılım
- Ubuntu 22.04
- ROS2 Humble
- Gazebo Fortress
- Nav2
- SlamToolbox

## SLAM Konfigürasyonu

\`\`\`yaml
slam_toolbox:
  ros__parameters:
    solver_plugin: solver_plugins::CeresSolver
    ceres_linear_solver: SPARSE_NORMAL_CHOLESKY
    ceres_preconditioner: SCHUR_JACOBI
    mode: localization
\`\`\`

## Nav2 ile Navigasyon

Nav2, ROS2 için güçlü bir navigasyon stack'idir. Aşağıdaki özellikleri içerir:

- Global ve local planlayıcılar
- Davranış ağaçları
- Waypoint takibi

> "Robotik, teorik bilgiyi pratik uygulamalarla birleştirmenin en güzel yoludur."

Sorularınız için benimle iletişime geçebilirsiniz! 🤖`,
        tags: ["ROS2", "Robotik", "SLAM", "Tutorial"],
        createdAt: "2025-09-15T10:00:00Z",
        updatedAt: "2025-09-15T10:00:00Z"
    },
    {
        id: "2",
        title: "YOLO ile Nesne Tespiti: Başlangıç Rehberi",
        slug: "yolo-ile-nesne-tespiti-baslangic-rehberi",
        excerpt: "YOLO modellerini eğitmek ve drone görüntüleri üzerinde nesne tespiti yapmak için kapsamlı bir başlangıç rehberi.",
        content: `# YOLO ile Nesne Tespiti

YOLO (You Only Look Once), gerçek zamanlı nesne tespiti için en popüler deep learning modellerinden biridir.

## YOLO Nedir?

YOLO, tek bir forward pass ile görüntüdeki tüm nesneleri tespit edebilen bir CNN mimarisidir.

## Model Eğitimi

\`\`\`python
from ultralytics import YOLO

# Model yükle
model = YOLO('yolov8n.pt')

# Eğitim
results = model.train(
    data='dataset.yaml',
    epochs=100,
    imgsz=640,
    batch=16
)
\`\`\`

## Drone Görüntüleri için İpuçları

| Zorluk | Çözüm |
|--------|-------|
| Küçük nesneler | Daha yüksek çözünürlük |
| Farklı açılar | Veri augmentasyonu |
| Işık değişimleri | Renk augmentasyonu |

## Sonuç

YOLO ile nesne tespiti, özellikle drone uygulamalarında çok güçlü sonuçlar verebilir. Fine-tuning ile kendi veri setinize uyarlayabilirsiniz.`,
        tags: ["YOLO", "Deep Learning", "Computer Vision"],
        createdAt: "2024-12-20T14:30:00Z",
        updatedAt: "2024-12-22T09:00:00Z"
    },
    {
        id: "3",
        title: "Bilgisayar Mühendisliği Öğrencisi için Teknoloji Yol Haritası",
        slug: "bilgisayar-muhendisligi-ogrencisi-teknoloji-yol-haritasi",
        excerpt: "Bilgisayar mühendisliği öğrencileri için web geliştirme, yapay zeka ve robotik alanlarında öğrenme yol haritası.",
        content: `# Bilgisayar Mühendisliği Öğrencisi için Teknoloji Yol Haritası

3 yıllık üniversite deneyimimden edindiğim bilgilerle, bilgisayar mühendisliği öğrencileri için bir yol haritası oluşturdum.

## 1. Temel Programlama

İlk olarak şunları öğrenin:
- Python (esneklik ve yapay zeka için)
- C++ (performans ve sistem programlama için)
- JavaScript (web geliştirme için)

## 2. Web Geliştirme

\`\`\`javascript
// React ile modern web geliştirme
function App() {
  return (
    <div className="app">
      <h1>Merhaba Dünya!</h1>
    </div>
  );
}
\`\`\`

## 3. Yapay Zeka ve Makine Öğrenmesi

- PyTorch veya TensorFlow
- CNN, Transformer mimarileri
- YOLO gibi pratik modeller

## 4. Robotik (İsteğe Bağlı ama Harika!)

- ROS2 öğrenin
- Gazebo ile simülasyon yapın
- Gerçek robotlarla deneyim kazanın

## Öğrenci Takımlarına Katılın!

Teknofest gibi yarışmalar, teorik bilginizi pratiğe dökmenin en iyi yoludur. Ben GökmenUAV takımında çalışarak çok şey öğrendim.`,
        tags: ["Kariyer", "Öğrenci", "Roadmap"],
        createdAt: "2024-11-10T08:00:00Z",
        updatedAt: "2024-11-10T08:00:00Z"
    }
]
