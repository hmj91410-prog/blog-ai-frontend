import React, { useState, useRef } from 'react';
import { Camera, Star, MapPin, Send, ArrowLeft, RefreshCw, Copy, X, Image as ImageIcon, ExternalLink } from 'lucide-react';

export default function App() {
  const [formData, setFormData] = useState({
    place_name: '', location: '', visit_date: '',
    purpose: '', menu: '', keywords: '',
    price_eval: '가성비 보통', secret_tip: ''
  });
  
  const [rating, setRating] = useState(5);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCameraClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
    e.target.value = ''; 
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prevFiles) => 
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSubmit = async () => {
    if (!formData.place_name) return alert("장소 이름을 입력해주세요!");
    
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('place_name', formData.place_name);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('visit_date', formData.visit_date);
      formDataToSend.append('purpose', formData.purpose);
      formDataToSend.append('menu', formData.menu);
      formDataToSend.append('keywords', formData.keywords);
      formDataToSend.append('price_eval', formData.price_eval);
      formDataToSend.append('rating', rating);
      formDataToSend.append('secret_tip', formData.secret_tip);

      selectedFiles.forEach(file => {
        formDataToSend.append('images', file);
      });

      // ⭐ Render 백엔드 주소 확인
      const response = await fetch('https://blog-ai-backend-vcgz.onrender.com/generate-blog', {
        method: 'POST',
        body: formDataToSend,
      });
      
      const data = await response.json();
      
      if (data.content) {
        setResult(data.content);
      } else {
        alert("글 생성 실패: " + (data.error || "오류 발생"));
      }
    } catch (error) {
      alert("서버 연결 실패! 주소 확인 및 서버 상태를 확인해주세요.");
      console.error(error);
    }
    setLoading(false);
  };

  // ---------------------------------------------------------
  // [화면 1] 결과 뷰 (Result View)
  // ---------------------------------------------------------
  if (result) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 p-6 flex flex-col">
        <button
          onClick={() => setResult(null)}
          className="self-start mb-6 flex items-center text-gray-500 hover:text-black transition"
        >
          <ArrowLeft size={20} className="mr-1" /> 다시 쓰기
        </button>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex-grow">
          <h2 className="text-2xl font-bold mb-4 text-green-600 flex items-center">
            ✨ AI 리뷰 완성!
          </h2>

          {/* 사진 슬라이드 */}
          {selectedFiles.length > 0 && (
            <div className="flex gap-2 overflow-x-auto mb-6 pb-2 scrollbar-hide">
              {selectedFiles.map((file, index) => {
                const imgUrl = URL.createObjectURL(file);
                return (
                  <img 
                    key={`res-img-${index}`}
                    src={imgUrl} 
                    alt="review result" 
                    className="w-32 h-32 object-cover rounded-lg flex-shrink-0 border"
                  />
                );
              })}
            </div>
          )}

          {/* ✅ [강력 수정] 텍스트 렌더링 방어 코드 */}
          {/* 글자를 한 줄씩 쪼개서(span) 렌더링하여 번역기 간섭을 최소화합니다. */}
          <div className="prose prose-sm leading-relaxed text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
            {result.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                <span className="block min-h-[1.5em]">{line}</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 하단 버튼들 */}
        <div className="mt-6 space-y-3">
          <button
            className="w-full bg-gray-800 text-white py-4 rounded-xl font-bold text-lg flex justify-center items-center active:scale-95 transition hover:bg-gray-900 shadow-md"
            onClick={() => {
              navigator.clipboard.writeText(result);
              alert("글 내용이 복사되었습니다! \n이제 블로그 버튼을 눌러 붙여넣으세요.");
            }}
          >
            <Copy className="mr-2" size={20}/> 1. 글 내용 복사하기
          </button>

          <button
            className="w-full bg-[#03C75A] text-white py-4 rounded-xl font-bold text-lg flex justify-center items-center active:scale-95 transition hover:bg-[#02b150] shadow-md"
            onClick={() => {
              window.open('https://m.blog.naver.com/PostWriteForm.naver?blogId=foodbeauty_daily', '_blank');
            }}
          >
            <ExternalLink className="mr-2" size={20}/> 2. 내 블로그에 쓰러가기
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // [화면 2] 입력 폼 (Input View)
  // ---------------------------------------------------------
  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-24 font-sans">
      <header className="bg-white p-4 sticky top-0 border-b z-10 text-center font-bold text-lg shadow-sm text-gray-800">
        🍣 맛집 리뷰 생성기
      </header>

      <div className="p-5 space-y-6">
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
          <h3 className="font-bold flex items-center text-blue-600"><MapPin size={18} className="mr-1"/> 기본 정보</h3>
          <input name="place_name" placeholder="장소 이름 (예: 동국대 연어시장)" onChange={handleChange} className="w-full p-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"/>
          <input name="location" placeholder="위치 (예: 충무로역 3번 출구)" onChange={handleChange} className="w-full p-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"/>
          <div className="flex gap-2">
            <input name="visit_date" type="date" onChange={handleChange} className="w-1/2 p-3 border rounded-xl bg-gray-50"/>
            <select name="purpose" onChange={handleChange} className="w-1/2 p-3 border rounded-xl bg-gray-50">
              <option value="">방문 목적</option>
              <option>데이트</option><option>친구모임</option><option>혼밥</option><option>회식</option>
            </select>
          </div>
        </section>

        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold flex items-center text-gray-800"><Camera size={18} className="mr-1"/> 사진 선택</h3>
            {selectedFiles.length > 0 && (
              <span className="text-sm text-blue-600 font-medium">{selectedFiles.length}장 선택됨</span>
            )}
          </div>

          <div
            onClick={handleCameraClick}
            className="h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition"
          >
            <Camera size={24} className="mb-1"/>
            <span className="text-xs font-medium">터치하여 사진 추가</span>
          </div>
          
          <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />

          {selectedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border text-sm">
                  <div className="flex items-center overflow-hidden">
                    <ImageIcon size={14} className="text-gray-400 mr-2 flex-shrink-0"/>
                    <span className="text-gray-700 truncate max-w-[200px]">{file.name}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
          <h3 className="font-bold flex items-center text-orange-500"><Star size={18} className="mr-1"/> 경험 & 꿀팁</h3>
          <input name="menu" placeholder="주문한 메뉴" onChange={handleChange} className="w-full p-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-200"/>
          <input name="keywords" placeholder="맛 표현 (예: 입에서 살살 녹음)" onChange={handleChange} className="w-full p-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-200"/>
          <textarea name="secret_tip" placeholder="나만의 꿀팁 (예: 네이버 예약시 서비스)" onChange={handleChange} className="w-full p-3 border rounded-xl bg-gray-50 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-orange-200"></textarea>
          
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-bold text-gray-600">별점 평가</span>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(num => (
                <Star key={num} size={28}
                  className={`cursor-pointer transition ${num <= rating ? 'fill-yellow-400 text-yellow-400 scale-110' : 'text-gray-200'}`}
                  onClick={() => setRating(num)}
                />
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-white p-4 border-t z-20">
        <button onClick={handleSubmit} disabled={loading}
          className={`w-full text-white py-4 rounded-xl font-bold text-lg flex justify-center items-center transition shadow-lg
            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}>
          {loading ? <><RefreshCw className="animate-spin mr-2"/> AI가 분석 중...</> : <><Send className="mr-2"/> 리뷰 생성하기</>}
        </button>
      </div>
    </div>
  );
}