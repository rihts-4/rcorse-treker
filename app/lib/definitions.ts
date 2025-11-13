export interface ScheduleCourse {
    id: string;
    courseName: string;
    location: string;
    day: string;
    period: number;
    semester: string;
}

export interface Course {
    id: string;
    courseCode: number;
    courseName: string;
    gradeReq: number;
    semester: string;
    credit: number;
    category: string;
    location: string;
    period: number;
    day: string;
}

export interface Professor {
    id: string;
    name: string;
    email?: string;
    lab?: string;
}

export interface Review {
    id: string;
    courseId: string;
    rating: 1 | 2 | 3 | 4 | 5;
    comment: string;
    createdAt: string; 
};