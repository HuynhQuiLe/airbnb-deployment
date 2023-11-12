import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { httpsNoLoading } from "../api/config";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FooterFixed from "../components/FooterFixed";
import convertToSlug from "../utils/convertToSlug";
import ListRooms from "../components/ListRooms";

export default function CityPage() {
  const [cityId, setCityId] = useState(null);
  const [phongThue, setPhongThue] = useState(null);
  const { cityName } = useParams();
  const [cityNoSlug, setCityNoSlug] = useState(null);
  useEffect(() => {
    httpsNoLoading
      .get("/vi-tri")
      .then(res => {
        const tempData = [...res.data.content];
        const data = tempData.filter(item => convertToSlug(item.tinhThanh) === cityName);
        setCityId(data[0].id);
        setCityNoSlug(data[0].tinhThanh);
      })
      .catch(err => {
        console.error(err);
      });
  }, [cityName]);
  useEffect(() => {
    if (cityId !== null) {
      httpsNoLoading
        .get(`/phong-thue/lay-phong-theo-vi-tri?maViTri=${cityId}`)
        .then(res => {
          setPhongThue([...res.data.content]);
        })
        .catch(err => {
          console.error(err);
        });
    }
  }, [cityId]);
  if (phongThue === null)
    return (
      <div className='flex w-screen h-screen justify-center items-center'>
        <img src='https://demo4.cybersoft.edu.vn/static/media/loading.385774bd589cf582d0f4.gif' alt='loading gif' />
      </div>
    );
  const filter = ["Loại nơi ở", "Giá", "Đặt ngay", "Phòng và phòng ngủ", "Bộ lọc khác"];
  return (
    <>
      <Header />
      <div className='mx-auto w-[95%] grid grid-cols-1 lg:grid-cols-2 gap-3'>
        <div className='py-12 space-y-3 h-auto'>
          <p>Có {phongThue.length ?? 0} chỗ ở • 16 thg 4 - 14 thg 5 </p>
          <h1 className='font-bold text-3xl text-black'>Chỗ ở tại khu vực bản đồ đã chọn</h1>
          <div className='flex flex-wrap gap-3'>
            {filter.map((item, index) => (
              <button
                className='rounded-lg text-md bg-white text-black border border-gray-300 hover:border-gray-900 duration-300 px-6 py-2'
                key={index}
              >
                {item}
              </button>
            ))}
          </div>
          <div className='space-y-6'>
            {phongThue.map((item, index) => (
              <ListRooms key={index} item={item} cityNoSlug={cityNoSlug} />
            ))}
          </div>
        </div>
        <div className='h-screen w-full block sticky top-28 mt-16'>
          <iframe
            src={`https://www.google.com/maps/embed/v1/place?q=${cityNoSlug}&key=${import.meta.env.VITE_MAP_API_KEY}`}
            width='100%'
            height='550px'
            allowFullScreen=''
            loading='lazy'
            referrerPolicy='no-referrer-when-downgrade'
          ></iframe>
        </div>
      </div>
      <FooterFixed />
      <Footer />
    </>
  );
}