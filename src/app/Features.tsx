// src/app/Features.tsx
"use client";

import { useState } from "react";
import {
  FaCalculator,
  FaChartBar,
  FaShieldAlt,
  FaMobileAlt,
  FaCloudDownloadAlt,
  FaUsersCog,
} from "react-icons/fa";

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function Features() {
  const features: Feature[] = [
    {
      id: 1,
      title: "حساب دقيق للمستحقات",
      description:
        "حساب تلقائي ودقيق للرواتب والعلاوات والبدلات وفقًا للقوانين الحالية",
      icon: <FaCalculator className="w-6 h-6 text-violet-600" />,
    },
    {
      id: 2,
      title: "تقارير إحصائية",
      description:
        "إنشاء تقارير إحصائية متنوعة لتحليل البيانات واتخاذ القرارات المناسبة",
      icon: <FaChartBar className="w-6 h-6 text-violet-600" />,
    },
    {
      id: 3,
      title: "أمان وخصوصية",
      description:
        "تشفير البيانات وحمايتها من الاختراق مع ضمان خصوصية المعلومات الشخصية",
      icon: <FaShieldAlt className="w-6 h-6 text-violet-600" />,
    },
    {
      id: 4,
      title: "تطبيق جوال",
      description:
        "إمكانية الوصول للمنصة من خلال تطبيق الجوال في أي وقت ومن أي مكان",
      icon: <FaMobileAlt className="w-6 h-6 text-violet-600" />,
    },
    {
      id: 5,
      title: "تصدير البيانات",
      description:
        "إمكانية تصدير البيانات والتقارير بصيغ مختلفة مثل PDF و Excel",
      icon: <FaCloudDownloadAlt className="w-6 h-6 text-violet-600" />,
    },
    {
      id: 6,
      title: "إدارة المستخدمين",
      description: "إدارة صلاحيات المستخدمين وتوزيع المهام حسب الصلاحيات",
      icon: <FaUsersCog className="w-6 h-6 text-violet-600" />,
    },
  ];

  const [activeFeature, setActiveFeature] = useState<number>(1);

  return (
    <div className="py-8 md:py-16">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-800">
        مميزات المنصة
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`p-4 rounded-lg cursor-pointer transition-all duration-300 text-right ${
                activeFeature === feature.id
                  ? "bg-violet-100 border-violet-300 border"
                  : "bg-white border border-gray-200 hover:border-violet-200"
              }`}
              onClick={() => setActiveFeature(feature.id)}
            >
              <div className="flex justify-end mb-2">{feature.icon}</div>
              <h3 className="font-medium text-gray-800 mb-1">
                {feature.title}
              </h3>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex justify-end mb-4">
            {features.find((f) => f.id === activeFeature)?.icon}
          </div>
          <h3 className="text-xl font-semibold text-right text-gray-800 mb-3">
            {features.find((f) => f.id === activeFeature)?.title}
          </h3>
          <p className="text-right text-gray-600">
            {features.find((f) => f.id === activeFeature)?.description}
          </p>
        </div>
      </div>
    </div>
  );
}
