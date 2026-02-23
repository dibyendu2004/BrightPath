import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";

export const AppContext = createContext()

export const AppContextProvider = (props)=>{

const backendUrl = import.meta.env.VITE_BACKEND_URL
const currency = import.meta.env.VITE_CURRENCY
const navigate = useNavigate()

const { getToken } = useAuth()
const { user } = useUser()

const [allCourses, setAllCourses] = useState([])
const [isEducator, setIsEducator] = useState(false)
const [enrolledCourses, setEnrolledCourses] = useState([])
const [userData, setUserData] = useState(null)


// Fetch all courses

 const fetchAllCourses = async () => {
    try {
        const { data } = await axios.get(backendUrl + '/api/course/all');
        if (data.success) {
            setAllCourses(data.courses);
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message);
    }
 }

  // Fetch user data
  const fetchUserData = async () => {
    if (user) {
        try {
            const token = await getToken();
            const { data } = await axios.get(backendUrl + '/api/user/data', {
                headers: { Authorization: `Bearer ${token}`, userid: user.id }
            });
            if (data.success) {
                setUserData(data.user);
                if (data.user.role === 'educator') {
                    setIsEducator(true);
                }
            } else {
                if (data.message.includes('Profile not found')) {
                    const syncData = {
                        _id: user.id,
                        email: user.emailAddresses[0].emailAddress,
                        name: `${user.firstName} ${user.lastName}`,
                        imageUrl: user.imageUrl,
                    }
                    const { data: syncRes } = await axios.post(backendUrl + '/api/user/sync', syncData, {
                        headers: { Authorization: `Bearer ${token}`, userid: user.id }
                    });
                    if (syncRes.success) {
                        setUserData(syncRes.user);
                        if (syncRes.user.role === 'educator') {
                            setIsEducator(true);
                        }
                    }
                } else {
                    toast.error(data.message);
                }
            }
        } catch (error) {
            toast.error(error.message);
        }
    }
 }


 // function to calculate average rating of course

 const calculateRating = (course)=>{
    if(!course.courseRatings || course.courseRatings.length === 0){
        return 0;
    }
    let totalRating = 0;
    course.courseRatings.forEach(rating=>{
        totalRating+=rating.rating
    })
    return totalRating / course.courseRatings.length
 }


// Function to calculate course chapter time

const calculateChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent.map((lecture)=> time += lecture.lectureDuration)
    return humanizeDuration(time * 60 * 1000, {units: ["h", "m"] })
}


// Function to calculate course duration

const calculateCourseDuration = (course)=> {
    let time=0;
    course.courseContent.map((chapter)=> chapter.chapterContent.map(
        (lecture) => time += lecture.lectureDuration
    ))
    return humanizeDuration(time * 60 * 1000, {units: ["h", "m"] })

}


// Function to calculate No of lectures in the course

const calculateNoOfLectures = (course)=>{
    let totalLectures = 0;
    course.courseContent.forEach(chapter => {
        if(Array.isArray(chapter.chapterContent)){
            totalLectures += chapter.chapterContent.length
        }
    });
    return totalLectures;
}

//Fetch user enrolled courses

const fetchUserEnrolledCourses = async () => {
    if (user) {
        try {
            const token = await getToken();
            const { data } = await axios.get(backendUrl + '/api/user/enrolled-courses', {
                 headers: { Authorization: `Bearer ${token}`, userid: user.id }
            });
            if (data.success) {
                setEnrolledCourses(data.enrolledCourses);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }
}



useEffect(()=>{
    fetchAllCourses()
},[])

useEffect(() => {
    if (user) {
        fetchUserData();
        fetchUserEnrolledCourses();
    }
}, [user])

    const value = {
       currency,allCourses,navigate,calculateRating,
       isEducator,setIsEducator,calculateNoOfLectures,calculateCourseDuration,
       calculateChapterTime,enrolledCourses,fetchUserEnrolledCourses,
       backendUrl, userData, setUserData, fetchAllCourses
    }

return (
    <AppContext.Provider value={value}>
        {props.children}
    </AppContext.Provider>
)

}