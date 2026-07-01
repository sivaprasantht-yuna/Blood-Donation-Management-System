import React from "react";
import { Quote, Heart, Award } from "lucide-react";

const STORIES = [
  {
    id: 1,
    name: "Arjun Mehta",
    role: "Regular O- Donor",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    quote:
      "Being an O- donor, I was registered as a universal match. Last week around midnight, I received a critical alert on LifeDrop from City General Hospital. A road accident victim needed immediate blood. I went and donated; knowing that my blood directly saved that patient's life makes all the difference.",
    badge: "Life Saver",
    impact: "Saved 9 lives",
  },
  {
    id: 2,
    name: "Dr. Rachel Thomas",
    role: "Chief Surg. at Metro Health Care",
    image:
      "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=120",
    quote:
      "In surgery, every minute counts in securing matching blood. Before LifeDrop, we spent hours calling people and blood banks. Now, we broadcast an alert, and eligible compatible donors accept within minutes. It has revolutionized emergency medicine.",
    badge: "Partner Hospital",
    impact: "180+ Transfusions",
  },
  {
    id: 3,
    name: "Priya Sharma",
    role: "Recovered Recipient / Supporter",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120",
    quote:
      "During my emergency C-section, I went into severe hemorrhagic shock. Thanks to three voluntary donors who accepted our emergency broadcast on LifeDrop instantly, I held my baby girl in my arms. LifeDrop is not just an application, it's a blessing.",
    badge: "Survivor Stories",
    impact: "Grateful Mother",
  },
];

export default function SuccessStories() {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-semibold px-3 py-1 bg-red-50 text-red-600 rounded-full inline-flex items-center gap-1.5 mb-2">
          <Heart size={12} className="fill-red-600" /> Real Impact
        </span>
        <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Stories of Lives Saved
        </h3>
        <p className="text-gray-500 text-sm mt-2">
          Hear directly from donors, surgical heads, and survivors on how and
          why LifeDrop exists.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {STORIES.map((story, i) => (
          <div
            key={story.id}
            className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xl shadow-gray-50/50 flex flex-col justify-between relative group hover:border-red-100/50 transition-all duration-300"
          >
            <div className="absolute -top-4 -right-4 bg-red-50 text-red-500 w-12 h-12 rounded-full flex items-center justify-center opacity-10 group-hover:opacity-20 group-hover:scale-110 transition duration-300">
              <Quote size={28} />
            </div>

            <div>
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={story.image}
                  alt={story.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-red-50"
                />

                <div>
                  <h4 className="font-bold text-gray-900 leading-tight">
                    {story.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">{story.role}</p>
                </div>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed italic">
                "{story.quote}"
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded inline-flex items-center gap-1 uppercase">
                <Award size={10} /> {story.badge}
              </span>
              <span className="text-xs font-bold text-gray-900">
                {story.impact}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
