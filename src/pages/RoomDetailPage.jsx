import { FrownOutlined, MehOutlined, SmileOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import viVN from "antd/es/locale/vi_VN";
import { useEffect, useRef, useState } from "react";
import { https } from "../api/config";
import { Link, useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAirFreshener,
  faAward,
  faBacon,
  faBlackboard,
  faCalendar,
  faElevator,
  faHandsWash,
  faHeadset,
  faHeart,
  faKitchenSet,
  faParking,
  faStar,
  faSwimmingPool,
  faTv,
  faUpload,
  faWarehouse,
  faWifi,
} from "@fortawesome/free-solid-svg-icons";
import convertToSlug from "../utils/convertToSlug";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { Avatar, Button, ConfigProvider, Form, Image, Rate, message } from "antd";
import { useSelector } from "react-redux";
import CommentSection from "../components/Comment";
import TextArea from "antd/es/input/TextArea";
import { Comment } from "@ant-design/compatible";
import { defaultNoAvatar } from "../constants/defaultValues";
import { Home, Trophy, CalendarCheck2, Languages, ChevronRight } from "lucide-react";

const customIcons = {
  1: <FrownOutlined />,
  2: <FrownOutlined />,
  3: <MehOutlined />,
  4: <SmileOutlined />,
  5: <SmileOutlined />,
};

const chuNha = "Phong";

const Editor = ({ onChange, onSubmit, submitting, value, rateNum, onRateChange }) => (
  <>
    <Form.Item>
      <TextArea
        rows={4}
        onChange={onChange}
        value={value}
        style={{
          resize: "none",
        }}
        placeholder='Viết đánh giá...'
      />
    </Form.Item>
    <Form.Item>
      <Rate onChange={onRateChange} defaultValue={3} value={rateNum} character={({ index }) => customIcons[index + 1]} />
    </Form.Item>
    <Form.Item>
      <Button disabled={!value} htmlType='submit' loading={submitting} onClick={onSubmit} type='primary'>
        Thêm bình luận
      </Button>
    </Form.Item>
  </>
);

export default function RoomDetailPage() {
  const binhLuanRef = useRef(null);
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState(null);
  const [tienNghi, setTienNghi] = useState(5);
  const [hienThiTatCaTienNghi, setHienThiTatCaTienNghi] = useState(false);
  const { user } = useSelector(state => {
    return state.userSlice;
  });
  const [trungBinhRating, setTrungBinhRating] = useState(0);
  useEffect(() => {
    async function fetchData() {
      try {
        const roomResponse = await https.get(`/phong-thue/${roomId}`);
        const commentListResponse = await https.get(`/binh-luan/lay-binh-luan-theo-phong/${roomId}`);
        const cityResponse = await https.get(`/vi-tri/${roomResponse.data.content.maViTri}`);

        setRoom({
          ...roomResponse.data.content,
          tinhThanh: cityResponse.data.content.tinhThanh,
          quocGia: cityResponse.data.content.quocGia,
          danhSachBinhLuan: commentListResponse.data.content.reverse(),
        });
        console.log({
          ...roomResponse.data.content,
          tinhThanh: cityResponse.data.content.tinhThanh,
          quocGia: cityResponse.data.content.quocGia,
          danhSachBinhLuan: commentListResponse.data.content.reverse(),
        });
        const totalSao = commentListResponse.data.content.reduce((sum, item) => sum + item.saoBinhLuan, 0);
        if (commentListResponse.data.content.length === 0) {
          setTrungBinhRating("Chưa có đánh giá");
        } else {
          const tempNumber = totalSao / commentListResponse.data.content.length;
          const formatNumber = tempNumber % 1 === 0 ? tempNumber.toFixed(0) : tempNumber.toFixed(2);
          setTrungBinhRating(formatNumber);
        }
        const tempObjectRoom = { ...roomResponse.data.content };
        const trueValueCount = Object.keys(tempObjectRoom).filter(key => key !== "banLa" && tempObjectRoom[key] === true).length;
        setTienNghi(5 + trueValueCount);
      } catch (err) {
        setError("Đã xảy ra lỗi khi tìm nạp dữ liệu. Vui lòng thử lại sau.");
        console.error(err);
      }
    }

    fetchData();
  }, [roomId]);

  const [submitting, setSubmitting] = useState(false);
  const [value, setValue] = useState("");
  const [rating, setRating] = useState(3);
  const fetchCommentData = async () => {
    try {
      const commentListResponse = await https.get(`/binh-luan/lay-binh-luan-theo-phong/${roomId}`);
      setRoom(prevRoom => ({
        ...prevRoom,
        danhSachBinhLuan: commentListResponse.data.content.reverse(),
      }));
      const totalSao = commentListResponse.data.content.reduce((sum, item) => sum + item.saoBinhLuan, 0);
      setTrungBinhRating((totalSao / commentListResponse.data.content.length).toFixed(2));
    } catch (err) {
      setError("Đã xảy ra lỗi khi tìm nạp dữ liệu. Vui lòng thử lại sau.");
      console.error(err);
    }
  };
  const handleSubmit = () => {
    if (!value) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setValue("");
      setRating(3);
      https
        .post(
          `/binh-luan`,
          { maPhong: roomId, maNguoiBinhLuan: user.id, ngayBinhLuan: Date(), noiDung: value, saoBinhLuan: rating },
          {
            headers: { token: user.token },
          },
        )
        .then(() => {
          message.success("Bình luận đã được gửi đi!");
          fetchCommentData();
        })
        .catch(err => {
          message.error(err.response.data.content.replace(/^\w/, c => c.toUpperCase()));
        });
    }, 1000);
  };

  const handleChange = e => {
    setValue(e.target.value);
  };

  const handleRateChange = star => {
    setRating(star); // 1, 2, 3, 4, 5
  };

  if (error) {
    return <div className='mx-auto w-[95%] py-6 h-[200px]'>Lỗi: {error}</div>;
  }

  if (!room) {
    return <Spinner />;
  }

  return (
    <div className='mx-auto w-[95%] py-6 space-y-6'>
      <h1 className='font-bold text-black text-3xl'>{room.tenPhong}</h1>
      <div className='grid grid-cols-1 md:flex justify-between items-center gap-6'>
        <div className='grid md:flex gap-x-6 gap-y-3'>
          {room.danhSachBinhLuan.length > 0 && (
            <span className='space-x-2'>
              <FontAwesomeIcon className='w-4 h-4 text-[#FF5A5F]' icon={faStar} />
              <span className='text-black font-bold'>{trungBinhRating} / 5</span>
              <span
                onClick={() => binhLuanRef.current.scrollIntoView({ behavior: "smooth" })}
                className='underline cursor-pointer text-gray-600 hover:text-[#FF5A5F] duration-300'
              >
                ({room.danhSachBinhLuan.length}) đánh giá
              </span>
            </span>
          )}
          <span className='space-x-2'>
            <FontAwesomeIcon className='w-4 h-4 text-[#FF5A5F]' icon={faAward} />
            <span className='text-gray-600'>Chủ nhà siêu cấp</span>
          </span>
          <Link
            className='underline cursor-pointer text-gray-600 hover:text-[#FF5A5F] duration-300'
            to={`/roombycity/${convertToSlug(room.tinhThanh)}`}
          >
            {room.tinhThanh}, {room.quocGia}
          </Link>
        </div>
        <div className='space-x-6'>
          <span className='text-black hover:text-[#FF5A5F] duration-300 cursor-pointer space-x-2'>
            <FontAwesomeIcon className='w-4 h-4' icon={faUpload} />
            <span className='underline'>Chia sẻ</span>
          </span>
          <span className='text-black hover:text-[#FF5A5F] duration-300 cursor-pointer space-x-2'>
            <FontAwesomeIcon className='w-4 h-4' icon={faHeart} />
            <span className='underline'>Lưu</span>
          </span>
        </div>
      </div>
      <div className='w-full'>
        <Swiper slidesPerView={1} spaceBetween={0} loop={true} modules={[Pagination]} pagination={true} className='mySwiper mx-auto rounded-lg'>
          {Array.from({ length: 5 }).map((_, index) => (
            <SwiperSlide key={index}>
              <div className='w-full cursor-pointer'>
                <ConfigProvider locale={viVN}>
                  <Image width='100%' height='470px' alt='' src={room.hinhAnh} className='rounded-lg object-cover' />
                </ConfigProvider>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className='grid grid-cols-1 md:flex gap-3'>
        <div className='basis-9/12 space-y-6'>
          <div className='flex items-center justify-between'>
            <div className='space-y-3'>
              <h1 className='font-bold text-black text-2xl'>Toàn bộ căn hộ. Chủ nhà {chuNha}</h1>
              <p>
                {room.khach} khách • {room.phongNgu} phòng ngủ • {room.giuong} giường • {room.phongTam} phòng tắm
              </p>
            </div>
            <div className='relative'>
              <img className='w-12 h-12 rounded-full object-cover' alt='' src='https://demo1.cybersoft.edu.vn/static/media/avatarTix.546c691f.jpg' />
              <div className='absolute top-7 left-7'>
                <svg viewBox='0 0 14 24' role='presentation' aria-hidden={true} focusable={false} className='w-6 h-6 block fill-current'>
                  <path
                    d='m10.5 20.0005065c0 1.9326761-1.56704361 3.4994935-3.5 3.4994935s-3.5-1.5668174-3.5-3.4994935c0-1.9326762 1.5670426-3.5005065 3.5-3.5005065s3.5 1.5678303 3.5 3.5005065m-9.99486248-18.58757644-.00513752 8.13836018c0 .45796416.21682079.88992936.58880718 1.17090736l5.07730539 3.831699c.4870761.367971 1.16836618.367971 1.65647028.0009994l5.08141685-3.8266984c.3719859-.2789784.5898342-.7109444.5908612-1.16790827.0010271-1.75186288.0041101-6.21051146.0051391-8.14035983 0-.50396002-.4202834-.91292822-.9392158-.91292822l-11.11643181-.00699945c-.51790391-.00099942-.93818728.40796878-.93921487.91292823'
                    fill='#fff'
                  ></path>
                  <path
                    d='m12 9.5-5-3.70124468 5-3.79875532zm-6.1292309 9.187485c-.52182677.3180834-.8707691.8762459-.8707691 1.5144379 0 .9937534.83703449 1.7980771 1.870162 1.7980771.81806646 0 1.50434636-.5065007 1.75946763-1.2095239z'
                    fill='#ffb400'
                  ></path>
                  <path d='m12 9.5-5 3.75-5-3.75v-7.5z' fill='#ff5a5f'></path>
                  <path
                    d='m7 24c-2.2060547 0-4-1.7939453-4-3.9990234 0-2.2060547 1.7939453-4.0009766 4-4.0009766s4 1.7949219 4 4.0009766c0 2.2050781-1.7939453 3.9990234-4 3.9990234zm0-7c-1.6542969 0-3 1.3466797-3 3.0009766 0 1.6533203 1.3457031 2.9990234 3 2.9990234s3-1.3457031 3-2.9990234c0-1.6542969-1.3457031-3.0009766-3-3.0009766zm.0039062-1.8242188c-.4560547 0-.9121094-.1064453-1.2617188-.3164062l-5.0458984-3.8642578c-.4697265-.3642578-.696289-.8525391-.696289-1.4951172v-8c.0009766-.3730469.1679688-.7529297.4580078-1.0429688.2900391-.2905273.6689453-.4570312 1.0410156-.4570312h.0019531 10.9990235c.7851562 0 1.5.7148438 1.5 1.5v7.9277344c-.0009766.6762695-.2421875 1.2177734-.6953125 1.5668945l-5.0009766 3.8325195c-.3505859.2333985-.8251953.3486328-1.2998047.3486328zm-5.5058593-14.1757812c-.1044922 0-.2324219.0625-.3330078.1635742-.1015625.1020508-.1650391.230957-.1650391.3374024v7.9990234c0 .3305664.0888672.5341797.3066406.703125l4.9970703 3.8310547c.3330078.1953125 1.0859375.2001953 1.4208984-.0205078l4.9716797-3.8125c.2001954-.1542969.3027344-.4155274.303711-.7749024v-7.9267578c0-.2285156-.2714844-.4995117-.5-.4995117h-11-.0009766s0 0-.0009765 0z'
                    fill='#484848'
                  ></path>
                </svg>
              </div>
            </div>
          </div>
          <div className='w-full h-px bg-gray-300 mb-6'></div>
          <div className='space-y-6'>
            <div className='flex gap-3'>
              <Home />
              <div className='space-y-1'>
                <h1 className='text-sm font-bold'>Toàn bộ nhà</h1>
                <p className='text-sm text-gray-600 text-justify'>Bạn sẽ có chung cư cao cấp cho riêng mình.</p>
              </div>
            </div>
            <div className='flex gap-3'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='lucide lucide-sparkles'
              >
                <path d='m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z' />
                <path d='M5 3v4' />
                <path d='M19 17v4' />
                <path d='M3 5h4' />
                <path d='M17 19h4' />
              </svg>
              <div className='space-y-1'>
                <h1 className='text-sm font-bold'>Vệ sinh tăng cường</h1>
                <p className='text-sm text-gray-600 text-justify space-x-1'>
                  <span>Chủ nhà này đã cam kết thực hiện quy trình vệ sinh tăng cường 5 bước của Airbnb.</span>
                  <span className='font-bold underline text-black cursor-pointer'>Hiển thị thêm</span>
                </p>
              </div>
            </div>
            <div className='flex gap-3'>
              <Trophy />
              <div className='space-y-1'>
                <h1 className='text-sm font-bold'>{chuNha} là chủ nhà siêu cấp</h1>
                <p className='text-sm text-gray-600 text-justify'>
                  Chủ nhà siêu cấp là những chủ nhà có kinh nghiệm, được đánh giá cao và là những người cam kết mang lại quãng thời gian ở tuyệt vời
                  cho khách.
                </p>
              </div>
            </div>
            <div className='flex gap-3'>
              <CalendarCheck2 />
              <div className='space-y-1'>
                <h1 className='text-sm font-bold'>Miễn phí hủy trong 48 giờ</h1>
              </div>
            </div>
          </div>
          <div className='w-full h-px bg-gray-300 mb-6'></div>
          <div className='space-y-6'>
            <img className='w-36' alt='' src='https://a0.muscache.com/im/pictures/54e427bb-9cb7-4a81-94cf-78f19156faad.jpg' />
            <p className='text-justify'>
              Mọi đặt phòng đều được bảo vệ miễn phí trong trường hợp chủ nhà {chuNha} hủy, thông tin nhà/phòng cho thuê không chính xác và những vấn
              đề khác như sự cố trong quá trình nhận phòng.
            </p>
            <p className='font-bold underline text-black flex cursor-pointer'>
              <span>Tìm hiểu thêm</span>
            </p>
          </div>
          <div className='w-full h-px bg-gray-300 mb-6'></div>
          <div>
            <button className='w-full text-black bg-white border-2 border-black rounded-lg py-3 hover:bg-gray-200 duration-300 flex justify-between items-center px-6'>
              <span>Dịch sang tiếng Việt</span>
              <Languages />
            </button>
          </div>
          <p className='text-justify'>
            My apartment located on nearly top floor of condominium in Vung Tau. The balcony and 2 bedrooms windows face to mountains, ocean, big lake
            and whole city view. You can easily access to attractions nearby: Beaches, temples, church, fresh seafood market, convenient stores,
            coffee shops, pharmacy, lighthouse, night market...
          </p>
          <p className='font-bold underline text-black flex cursor-pointer'>
            <span>Hiển thị thêm</span>
            <ChevronRight />
          </p>
          <div className='w-full h-px bg-gray-300 mb-6'></div>
        </div>
        <div className='basis-3/12'>2</div>
      </div>
      <div className='space-y-6'>
        <h1 className='font-bold text-black text-3xl'>Tiện nghi</h1>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {room.bep && (
            <div className='space-x-3'>
              <span>
                <FontAwesomeIcon className='w-5 h-5' icon={faKitchenSet} />
              </span>
              <span>Bếp</span>
            </div>
          )}
          {room.wifi && (
            <div className='space-x-3'>
              <span>
                <FontAwesomeIcon className='w-5 h-5' icon={faWifi} />
              </span>
              <span>Wifi</span>
            </div>
          )}
          {room.tivi && (
            <div className='space-x-3'>
              <span>
                <FontAwesomeIcon className='w-5 h-5' icon={faTv} />
              </span>
              <span>TV với truyền hình cáp tiêu chuẩn</span>
            </div>
          )}
          {true && (
            <div className='space-x-3'>
              <span>
                <FontAwesomeIcon className='w-5 h-5' icon={faElevator} />
              </span>
              <span>Thang máy</span>
            </div>
          )}
          {room.dieuHoa && (
            <div className='space-x-3'>
              <span>
                <FontAwesomeIcon className='w-5 h-5' icon={faAirFreshener} />
              </span>
              <span>Điều hòa nhiệt độ</span>
            </div>
          )}
          {true && (
            <div className='space-x-3'>
              <span>
                <FontAwesomeIcon className='w-5 h-5' icon={faBlackboard} />
              </span>
              <span>Sân hoặc ban công</span>
            </div>
          )}
          {true && (
            <div className='space-x-3'>
              <span>
                <FontAwesomeIcon className='w-5 h-5' icon={faHeadset} />
              </span>
              <span>Lò sưởi trong nhà</span>
            </div>
          )}
          {true && (
            <div className='space-x-3'>
              <span>
                <FontAwesomeIcon className='w-5 h-5' icon={faWarehouse} />
              </span>
              <span>Tủ lạnh</span>
            </div>
          )}
          {room.doXe && (
            <div className='space-x-3'>
              <span>
                <FontAwesomeIcon className='w-5 h-5' icon={faParking} />
              </span>
              <span>Bãi đỗ xe thu phí nằm ngoài khuôn viên</span>
            </div>
          )}
          {true && (
            <div className='space-x-3'>
              <span>
                <FontAwesomeIcon className='w-5 h-5' icon={faCalendar} />
              </span>
              <span>Cho phép dài hạn</span>
            </div>
          )}
          {hienThiTatCaTienNghi && (
            <>
              {room.banUi && (
                <div className='space-x-3'>
                  <span>
                    <FontAwesomeIcon className='w-5 h-5' icon={faBacon} />
                  </span>
                  <span>Bàn ủi</span>
                </div>
              )}
              {room.hoBoi && (
                <div className='space-x-3'>
                  <span>
                    <FontAwesomeIcon className='w-5 h-5' icon={faSwimmingPool} />
                  </span>
                  <span>Hồ bơi</span>
                </div>
              )}
              {room.mayGiat && (
                <div className='space-x-3'>
                  <span>
                    <FontAwesomeIcon className='w-5 h-5' icon={faHandsWash} />
                  </span>
                  <span>Máy giặt</span>
                </div>
              )}
            </>
          )}
        </div>
        <div>
          {!hienThiTatCaTienNghi ? (
            <button
              onClick={() => setHienThiTatCaTienNghi(true)}
              className='w-56 text-black bg-white border-2 border-black rounded-lg p-3 hover:bg-gray-200 duration-300'
            >
              Hiển thị tất cả {tienNghi} tiện nghi
            </button>
          ) : (
            <div className='mt-6'>
              <button
                onClick={() => setHienThiTatCaTienNghi(false)}
                className='w-56 text-black bg-white border-2 border-black rounded-lg p-3 hover:bg-gray-200 duration-300'
              >
                Ẩn bớt tiện nghi
              </button>
            </div>
          )}
        </div>
      </div>
      {room.danhSachBinhLuan.length > 0 && <div ref={binhLuanRef} className='pb-[50px]'></div>}
      <div className='w-full h-px bg-gray-300 mb-6'></div>
      <h1 className='font-bold text-3xl text-black'>Bình luận</h1>
      {room.danhSachBinhLuan.length > 0 ? (
        <>
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-12 ${
              room.danhSachBinhLuan.length > 4 && "h-[300px]"
            } overscroll-y-auto overflow-y-auto px-2`}
          >
            {room.danhSachBinhLuan.map((item, index) => (
              <CommentSection key={index} item={item} />
            ))}
          </div>
        </>
      ) : (
        <p>Chưa có bình luận nào! Bạn hãy trở thành người đầu tiên nhé 😍</p>
      )}
      <div className='w-full h-px bg-gray-300 mb-6'></div>
      {user === null ? (
        <div>Vui lòng đăng nhập để bình luận!</div>
      ) : (
        <div>
          <Comment
            avatar={<Avatar src={user?.avatar !== "" ? user?.avatar : defaultNoAvatar} alt='' />}
            content={
              <Editor
                onRateChange={handleRateChange}
                onChange={handleChange}
                onSubmit={handleSubmit}
                submitting={submitting}
                value={value}
                rateNum={rating}
              />
            }
          />
        </div>
      )}
    </div>
  );
}

Editor.propTypes = {
  onChange: PropTypes.func.isRequired,
  onRateChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  value: PropTypes.string.isRequired,
  rateNum: PropTypes.number.isRequired,
};
