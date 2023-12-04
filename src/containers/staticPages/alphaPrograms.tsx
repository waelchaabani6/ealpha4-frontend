import RouteLayout from '@layout/routeLayout';
import React from 'react';
import ELAImage from '@images/staticPageImages/ELA.png';
import MathsImage from '@images/staticPageImages/Maths.png';
import ScienceImage from '@images/staticPageImages/science.png';
import PrePrimaryImage from '@images/staticPageImages/pre_primary.png';
import PrimaryMenaImage from '@images/staticPageImages/pre_mena_edition.png';
import SecondaryImage from '@images/staticPageImages/EL_secondary.png';
import PrimaryKSAImage from '@images/staticPageImages/pre-_KSA_edition.png';
import AdultImage from '@images/staticPageImages/adult.png';
import Button from '@component/button/button';
import { useGet } from '@shared/api/useApi';
import StaticHeader from './staticHeader';
import StaticFooter from './staticFooter';

export default function AlphaPrograms() {
  const { isLoading: pageLoading, data: pageContent } = useGet({
    baseURL: import.meta.env.VITE_APP_CMS_SERVICE_URL,
    url: `cms-service/page/4/`
  });
  return (
    <RouteLayout navBack={false}>
      <StaticHeader />
      {/* eslint-disable-next-line react/no-danger */}
      <div className="mt-24" dangerouslySetInnerHTML={{ __html: pageContent?.data?.response?.content }} />
      {/* <h2 className="text-3xl my-4 mt-28 pl-5">Programs Overview</h2>
      <div className="h-full w-full p-5">
        <img src={ELAImage} alt="" />
        <div className="py-8 space-y-4">
          <p>
            The
            <strong> Alpha English Language Arts (ELA) </strong>
            program is designed to cover language arts instruction from pre-reading, kindergarten level to entry to higher education.
          </p>
          <p>
            The
            <strong> Alpha KG Reading </strong>
            program for KG1 and KG2 understands the importance of engaging children with the art of reading and setting them up for a lifelong love of literature.
          </p>
          <p>
            <strong> Alpha Reading </strong>
            and
            <strong> Alpha Literature </strong>
            provide up-to-date pedagogy and instruction in English language arts with a focus on literature and informational texts. The programs follow the Common Core State Standards (CCSS) for English Language Arts and Literacy.
          </p>
        </div>
        <div className="flex justify-center">
          <a href="http://www.alphapublishing.com/k-12/english/" target="_blank" rel="noreferrer">
            <Button
              sx={{ backgroundColor: 'var(--sunlight)' }}
            >
              Learn More
            </Button>
          </a>
        </div>
      </div>
      <div className="h-full w-full p-5">
        <img src={MathsImage} alt="" />
        <div className="py-8 space-y-4">
          <strong> Alpha KG Math </strong>
          for KG1 and KG2, and
          <strong> Alpha Mathematics </strong>
          are fully aligned to the Common Core State Standards (CCSS) for Mathematics and provide a wide range of exercises and practices that gradually increase in complexity. They can be personalized and tailored to the needs of the classroom. Each grade has a unique child-friendly theme that flows throughout the program with fun math rhymes in the lower grades. In grades 1–5, each chapter begins with the standards that will be covered, helping students understand their learning objectives.
        </div>
        <div className="flex justify-center">
          <a href="http://www.alphapublishing.com/elt/pre-primary/" target="_blank" rel="noreferrer">
            <Button
              sx={{ backgroundColor: 'var(--sunlight)' }}
            >
              Learn More
            </Button>
          </a>
        </div>
      </div>
      <div className="h-full w-full p-5">
        <img src={ScienceImage} alt="" />
        <div className="py-8 space-y-4">
          <strong> Alpha Science </strong>
          is modeled after the Next Generation Science Standards (NGSS) and encourages students to listen to their natural curiosity and search for answers to their questions. Students learn best through exploration and practical application that create real-world connections. Through student-driven practice, teachers can encourage students to drive the classroom learning experience. The framework of Alpha Science is built on performance expectations and the three-dimensional learning approach of the NGSS.
        </div>
        <div className="flex justify-center">
          <a href="http://www.alphapublishing.com/k-12/science/" target="_blank" rel="noreferrer">
            <Button
              sx={{ backgroundColor: 'var(--sunlight)' }}
            >
              Learn More
            </Button>
          </a>
        </div>
      </div>
      <div className="h-full w-full p-5">
        <img src={PrePrimaryImage} alt="" />
        <div className="py-8 space-y-4">
          <strong> Pandy and Friends (MENA) </strong>
          is a three-level course for pre-school children aged between 3 and 5, which offers a wide range of materials to ensure enjoyable lessons for very young learners.
        </div>
        <div className="flex justify-center my-4">
          <a href="http://www.alphapublishing.com/elt/pre-primary/" target="_blank" rel="noreferrer">
            <Button
              sx={{ backgroundColor: 'var(--sunlight)' }}
            >
              Learn More
            </Button>
          </a>
        </div>
      </div>
      <div className="h-full w-full p-5">
        <img src={PrimaryMenaImage} alt="" />
        <div className="py-8 space-y-4">
          <strong> Super English Reading & Writing </strong>
          is a seven-level course especially designed for young learners of English in the Middle East and North Africa from beginner to pre-intermediate ability. It has been developed to help learners to dramatically improve their reading and writing skills. Learners will experience stories covering a variety of genres that are interesting and informative. Following these stories, learners will be able to create concrete pieces of writing which will incorporate the target language patterns.
        </div>
        <div className="flex justify-center">
          <a href="http://www.alphapublishing.com/elt/primary/super-english-reading-writing/" target="_blank" rel="noreferrer">
            <Button
              sx={{ backgroundColor: 'var(--sunlight)' }}
            >
              Learn More
            </Button>
          </a>
        </div>
        <p>
          <strong> Super English Speaking & Listening </strong>
          is a seven-level course especially designed for young learners of English in the Middle East and North Africa from beginner to pre-intermediate ability. It has been developed to help learners dramatically improve their speaking and listening skills. Students are introduced to basic sentences, vocabulary and everyday questions that are essential for young English speakers.
        </p>
        <div className="flex justify-center my-4">
          <a href="http://www.alphapublishing.com/elt/primary/super-english-speaking-listening/" target="_blank" rel="noreferrer">
            <Button
              sx={{ backgroundColor: 'var(--sunlight)' }}
            >
              Learn More
            </Button>
          </a>
        </div>
        <p>
          <strong> Go for English </strong>
          is a progressive six-level English course developed for primary school students learning English as their second language, or as a foreign language in the Middle East and North Africa. It’s designed to teach our target learners through a creative language approach, covering the four skills of reading, writing, speaking and listening.
        </p>
        <div className="flex justify-center my-4">
          <a href="http://www.alphapublishing.com/elt/primary/go-for-english/" target="_blank" rel="noreferrer">
            <Button
              sx={{ backgroundColor: 'var(--sunlight)' }}
            >
              Learn More
            </Button>
          </a>
        </div>
      </div>
      <div className="h-full w-full p-5">
        <img src={PrimaryKSAImage} alt="" />
        <div className="py-8 space-y-4">
          <strong> Super English Reading & Writing </strong>
          is a seven-level course especially designed for young learners of English in the Kingdom of Saudi Arabia from beginner to intermediate ability. It has been developed to help learners to dramatically improve both their reading and writing skills. Learners will experience stories covering a variety of genres that are both interesting and informative. Following these stories, learners will be able to create concrete pieces of writing which will incorporate the target language patterns.
        </div>
        <div className="flex justify-center my-4">
          <a href="http://www.alphapublishing.com/elt/primary/super-english-reading-writing-ksa/" target="_blank" rel="noreferrer">
            <Button
              sx={{ backgroundColor: 'var(--sunlight)' }}
            >
              Learn More
            </Button>
          </a>
        </div>
        <p>
          <strong> Super English Speaking & Listening </strong>
          is a seven-level course especially designed for young learners of English in the Kingdom of Saudi Arabia from beginner to pre-intermediate ability. It has been developed to help learners dramatically improve both their speaking and listening skills. Students are introduced to basic sentences, vocabulary and everyday questions that are essential for young English speakers.
        </p>
        <div className="flex justify-center my-4">
          <a href="http://www.alphapublishing.com/elt/primary/super-english-reading-writing-ksa/" target="_blank" rel="noreferrer">
            <Button
              sx={{ backgroundColor: 'var(--sunlight)' }}
            >
              Learn More
            </Button>
          </a>
        </div>
        <p>
          <strong> Go for English </strong>
          is a progressive six-level English course developed for primary school students learning English as their second language, or as a foreign language in the Kingdom of Saudi Arabia. It’s designed to teach our target learners through a creative language approach, covering the four skills of reading, writing, speaking and listening.
        </p>
        <div className="flex justify-center my-4">
          <a href="http://www.alphapublishing.com/elt/primary/go-for-english-ksa/" target="_blank" rel="noreferrer">
            <Button
              sx={{ backgroundColor: 'var(--sunlight)' }}
            >
              Learn More
            </Button>
          </a>
        </div>
      </div>
      <div className="h-full w-full p-5">
        <img src={SecondaryImage} alt="" />
        <div className="py-8 space-y-4">
          <strong> English Leader </strong>
          is a new four-level course specifically adapted for young teenage students in the Middle East and North Africa.
          <p className="py-2">
            The comprehensive syllabus places academic coursework within a broader historical, geographical and cultural context, ensuring an educational and stimulating experience for students. The CLIL approach allows students to absorb and discuss real-world information at their level of English.
          </p>
        </div>
        <div className="flex justify-center my-4">
          <a href="http://www.alphapublishing.com/elt/secondary/" target="_blank" rel="noreferrer">
            <Button
              sx={{ backgroundColor: 'var(--sunlight)' }}
            >
              Learn More
            </Button>
          </a>
        </div>
      </div>
      <div className="h-full w-full p-5">
        <img src={AdultImage} alt="" />
        <div className="py-8 space-y-4">
          <strong> Target English </strong>
          is a motivating, four-level, carefully graded English course specifically adapted for young adult students in the Middle East and North Africa, providing thorough grammar, vocabulary and skills work through content which is interesting to young adults. The combination of clear, easy-to-use printed, digital, and online materials, and the particular attention paid to the needs of mixed-ability classes and different learning styles, make Target English readily adaptable to any teaching situation.
        </div>
        <div className="flex justify-center my-4">
          <a href="http://www.alphapublishing.com/elt/adult/target-english/" target="_blank" rel="noreferrer">
            <Button
              sx={{ backgroundColor: 'var(--sunlight)' }}
            >
              Learn More
            </Button>
          </a>
        </div>
      </div> */}
      <StaticFooter />
    </RouteLayout>
  );
}
