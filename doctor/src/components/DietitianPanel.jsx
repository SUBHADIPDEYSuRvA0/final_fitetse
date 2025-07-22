import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./DietitianPanel.css";

const dietitians = [
  {
    name: "Dt. Riya Sharma",
    experience: "5+ years",
    languages: "English, Hindi",
    consultations: "More than 300",
    rating: 4,
    image: "/doctor.jpeg"
  },
  {
    name: "Dt. Aarav Mehta",
    experience: "7+ years",
    languages: "English, Hindi",
    consultations: "More than 500",
    rating: 5,
    image: "/doctor.jpeg"
  },
  {
    name: "Dt. Pooja Patel",
    experience: "3+ years",
    languages: "English, Gujarati",
    consultations: "More than 150",
    rating: 4,
    image: "/doctor.jpeg"
  },
  {
    name: "Dt. Rahul Verma",
    experience: "9+ years",
    languages: "English, Hindi",
    consultations: "More than 800",
    rating: 5,
    image: "/doctor.jpeg"
  },
  {
    name: "Dt. Rahul Verma",
    experience: "9+ years",
    languages: "English, Hindi",
    consultations: "More than 800",
    rating: 4,
    image: "/doctor.jpeg"
  }
];

export default function DietitianPanel() {
  return (
    <section className="dietitian-panel">
      <h2 className="dietitian-heading">Our Panel Dietitian</h2>
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={30}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {dietitians.map((dietitian, index) => (
          <SwiperSlide key={index}>
            <div className="dietitian-card">
              <img src={dietitian.image} alt={dietitian.name} className="dietitian-img" />
              <h3 className="dietitian-name">{dietitian.name}</h3>
              <p className="dietitian-exp">Dietitian (Exp.: {dietitian.experience})</p>
              <p className="dietitian-lang"><strong>Pref. language :</strong> {dietitian.languages}</p>
              <p className="dietitian-consult"><strong>No Of Consultation Completed :</strong><br /> {dietitian.consultations}</p>
              <p className="dietitian-review">Patients Review</p>
              <div className="dietitian-stars">
                {Array.from({ length: dietitian.rating }, (_, i) => (
                  <span key={i} className="star">⭐</span>
                ))}
              </div>
              
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
