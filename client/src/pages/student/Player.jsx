import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { useParams } from "react-router-dom";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import YouTube from "react-youtube";
import Footer from "../../components/student/Footer";
import { Rating } from "react-simple-star-rating";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "react-toastify";

const Player = () => {

  const { enrolledCourses, calculateChapterTime, backendUrl, userData, fetchUserEnrolledCourses } = useContext(AppContext)
  const { getToken } = useAuth()
  const { courseId } = useParams()
  const [courseData, setCourseData] = useState(null)
  const [openSections, setOpenSections] = useState({})
  const [playerData, setPlayerData] = useState(null)
  const [progressData, setProgressData] = useState(null)

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(?:youtu.be\/|v\/|e\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
  }

  const getCourseData = () => {
    const course = enrolledCourses.find((course) => course._id === courseId)
    if (course) {
      setCourseData(course)
    }
  }

  const fetchUserCourseProgress = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get(backendUrl + '/api/user/progress/' + courseId, {
        headers: { Authorization: `Bearer ${token}`, userid: userData._id }
      })
      if (data.success) {
        setProgressData(data.progress)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const markCompleted = async (lectureId) => {
    try {
      const token = await getToken()
      const { data } = await axios.post(backendUrl + '/api/user/update-progress', { courseId, lectureId }, {
        headers: { Authorization: `Bearer ${token}`, userid: userData._id }
      })
      if (data.success) {
        toast.success(data.message)
        fetchUserCourseProgress()
      }
    } catch (error) {
       toast.error(error.message)
    }
  }

  const handleRating = async (rate) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(backendUrl + '/api/user/rating', { courseId, rating: rate }, {
        headers: { Authorization: `Bearer ${token}`, userid: userData._id }
      });
      if (data.success) {
        toast.success(data.message);
        fetchUserEnrolledCourses();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseData()
    }
  }, [enrolledCourses])

  useEffect(() => {
    if (userData) {
      fetchUserCourseProgress()
    }
  }, [userData])


  return (
    <>
      <div className="p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36">
        {/* left column */}
        <div className="text-gray-800">
          <h2 className="text-xl font-semibold">Course Structure</h2>
          <div className="pt-5">
            {courseData && courseData.courseContent.map((chapter, index) => (
              <div
                key={index}
                className="border border-gray-300 bg-white mb-2 rounded"
              >
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                  onClick={() => toggleSection(index)}
                >
                  <div className="flex items-center gap-2">
                    <img
                      className={`transform transition-transform ${openSections[index] ? "rotate-180" : ""
                        }`}
                      src={assets.down_arrow_icon}
                      alt="arrow icon"
                    />
                    <p className="font-medium md:text-base text-sm">
                      {chapter.chapterTitle}
                    </p>
                  </div>
                  <p className="text-sm md:text-default">
                    {chapter.chapterContent.length} lectures -{" "}
                    {calculateChapterTime(chapter)}
                  </p>
                </div>

                <div
                  className={`overflow-hidden translate-all duration-300 ${openSections[index] ? "max-h-96" : "max-h-0"
                    }`}
                >
                  <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                    {chapter.chapterContent.map((lecture, i) => (
                      <li key={i} className="flex items-start gap-2 py-1">
                        <img
                          src={progressData && progressData.completedLectures.includes(lecture.lectureId) ? assets.blue_tick_icon : assets.play_icon}
                          alt="play icon"
                          className="w-4 h-4 mt-1"
                        />
                        <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                          <p>{lecture.lectureTitle}</p>
                          <div className="flex gap-2">
                            {lecture.lectureUrl && (
                              <p
                                onClick={() =>
                                  setPlayerData({
                                    ...lecture, chapter: index + 1, lecture: i + 1
                                  })
                                }
                                className="text-blue-500 cursor-pointer"
                              >
                                Watch
                              </p>
                            )}
                            <p>
                              {humanizeDuration(
                                lecture.lectureDuration * 60 * 1000,
                                { units: ["h", "m"] }
                              )}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 py-3 mt-10">
            <h1 className="text-xl font-bold">Rate this Course:</h1>
            <div className='flex flex-row flex-nowrap shrink-0'>
              <Rating onClick={handleRating} initialValue={userData.courseRatings?.find(r => r.courseId === courseId)?.rating || 0} size={25} />
            </div>
          </div>


        </div>

        {/* right column */}
        <div className="md:mt-10">
          {playerData ? (
            <div>
              {
                getYouTubeId(playerData.lectureUrl) ? 
                <YouTube
                  videoId={getYouTubeId(playerData.lectureUrl)}
                  iframeClassName="w-full aspect-video"
                /> : 
                <iframe src={playerData.lectureUrl} className="w-full aspect-video" allowFullScreen title="Lecture Video"></iframe>
              }
              <div className="flex justify-between items-center mt-1">
                <p>{playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}</p>
                <button onClick={() => markCompleted(playerData.lectureId)} className="text-blue-600">
                  {progressData && progressData.completedLectures.includes(playerData.lectureId) ? 'Completed' : 'Mark Completed'}
                </button>
              </div>
            </div>
          )
            :
            <img src={courseData ? courseData.courseThumbnail : ''} alt="" />
          }
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Player;
