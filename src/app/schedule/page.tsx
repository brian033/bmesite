import React from 'react';
import { Calendar, Clock, MapPin } from "lucide-react";

const conferenceSchedule = {
    title: "2025 生機與農機學術研討會大會議程",
    dates: "114年9月25-26日（星期四~五）",
    location: "國立臺灣大學生物機電工程系 系館",
    days: [{
        date: "114年9月25日(四)",
        // Decoupled time slots
        eventTimes: [
            "09:00-09:30", // 0
            "09:30-10:00", // 1
            "10:00-10:30", // 2
            "10:30-11:05", // 3
            "11:05-11:40", // 4
            "11:40-12:10", // 5
            "12:30-13:00", // 6
            "13:00-13:30", // 7
            "13:30-15:00", // 8
            "15:00-15:20", // 9
            "15:20-15:40", // 10
            "15:40-16:40", // 11
            "16:40-17:20", // 12
            "17:20-17:30", // 13
            "18:00-20:30", // 14
        ],
        events: [
        {
            activity: "開放報到",
            location: "生機館1F",
            details: ["開放報到時間: 09:00 ~ 14:00"],
            start_time_index: 0,
            num_of_time_slot: 1,
            num_of_columns: 3,
        },
        {
            activity: "開幕典禮暨台灣生物機電學會年會",
            location: "鄭江樓北棟信義講堂",
            start_time_index: 1,
            num_of_time_slot: 1,
            num_of_columns: 3,
        },
        {
            activity: "開幕、貴賓致詞、捐贈與頒獎儀式、大合照時間",
            location: "鄭江樓北棟信義講堂",
            start_time_index: 2,
            num_of_time_slot: 1,
            num_of_columns: 3,
        },
        {
            activity: "Plenary Speech I",
            location: "鄭江樓北棟信義講堂",
            details: [
                "主持人: 台灣生物機電學會邱奕志 理事長",
                "主講人: 農業科技司陳瑞榮副司長",
                "演講題目: 次世代台灣農機的發展方向與趨勢",
            ],
            start_time_index: 3,
            num_of_time_slot: 1,
            num_of_columns: 3,
        },
        {
            activity: "Plenary Speech II",
            location: "鄭江樓北棟信義講堂",
            details: [
                "主持人: 台灣生物機電學會邱奕志 理事長",
                "主講人: 中興大學詹富智校長",
                "演講題目: Bridging Nature and Machines: Safeguarding Orchids in the Digital Era: From Novel Virus Discovery to Next-Generation AI and Biosensing Technologies for Plant Health Management",
            ],
            start_time_index: 4,
            num_of_time_slot: 1,
            num_of_columns: 3,
        },
        {
            activity: "特別講者：中華農機學會國際貢獻獎",
            location: "鄭江樓北棟信義講堂",
            details: [
                "主講人: Dr. Sun-Ok Chung",
                "Chungnam National University, Korea",
            ],
            start_time_index: 5,
            num_of_time_slot: 1,
            num_of_columns: 3,
        },
        {
            activity: "中華農業機械學會年會",
            location: "知武館4F演講廳(401)",
            start_time_index: 6,
            num_of_time_slot: 2,
            num_of_columns: 1,
            parallel: "午餐",
            parallelLocation: "知武館2F教室",
            parallel_num_of_time_slot: 2,
            parallel_num_of_columns: 1,
        },
        {
            activity: "研發成果口頭發表",
            location: "知武館及生機館",
            start_time_index: 8,
            num_of_time_slot: 2,
        },
        {
            activity: "茶敘",
            location: "生機館、知武館1F",
            start_time_index: 10,
            num_of_time_slot: 1,
        },
        {
            activity: "研發成果口頭發表",
            location: "知武館及生機館",
            start_time_index: 11,
            num_of_time_slot: 3,
            parallel: "農機安全論壇",
            parallelLocation: "知武館4F演講廳(401)",
            parallelDetails: [
                "主持人: 蔡燿全博士",
                "主講人: 謝清祿博士",
                "與談人: 丁冠中博士、艾群博士、林達德博士、楊智凱組長",
            ],
            parallel_num_of_time_slot: 1,
            parallel_num_of_columns: 1,
        },
        {
            activity: "晚宴",
            location: "公館薪僑園水源婚宴會館",
            start_time_index: 14,
            num_of_time_slot: 1,
        }],
        posterEvent: [
            {
                activity: "第一組壁報布置",
                location: "知武館2F/3F/4F走廊",
                start_time_index: 6,
                num_of_time_slot: 1,
                isParallel: true,
            },
            {
                activity: "研發成果第一組壁報發表",
                location: "知武館2F/3F/4F走廊",
                start_time_index: 7,
                num_of_time_slot: 2,
                isParallel: true,
            },
            {
                activity: "第一組壁報拆除/第二組壁報布置",
                location: "知武館2F/3F/4F走廊",
                start_time_index: 9,
                num_of_time_slot: 1,
                isParallel: true,
            },
            {
                activity: "研發成果第二組壁報發表",
                location: "知武館2F/3F/4F走廊",
                start_time_index: 10,
                num_of_time_slot: 3,
                isParallel: true,
            },
            {
                activity: "第二組壁報拆除",
                location: "知武館2F/3F/4F走廊",
                start_time_index: 13,
                num_of_time_slot: 1,
                isParallel: true,
            },
        ],
    },
    {
        date: "114年9月26日(五)",
        eventTimes: ["09:00-11:00", "11:00-11:30", "11:30-12:00"],
        events: [
        {
            activity: "研發成果口頭發表",
            location: "知武館及生機館",
            start_time_index: 0,
            num_of_time_slot: 1,
            parallel: "報到",
            parallelLocation: "生機館1F",
            parallel_num_of_time_slot: 0,
            parallel_num_of_columns: 1,
        },
        {
            activity: "農機安全論壇之精彩回顧",
            location: "知武館4F演講廳(401)",
            start_time_index: 1,
            num_of_time_slot: 1,
        },
        {
            activity: "口頭競賽頒獎及閉幕典禮",
            location: "知武館4F演講廳(401)",
            start_time_index: 2,
            num_of_time_slot: 1,
        },
        ],
    },
    ],
};

export default function SchedulePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-center mb-2">
            {conferenceSchedule.title}
          </h1>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-8 text-center">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-green-700 mr-2" />
              <span>{conferenceSchedule.dates}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-green-700 mr-2" />
              <span>{conferenceSchedule.location}</span>
            </div>
          </div>
        </div>

        {/* 會議日程表 */}
        <div className="space-y-12">
          {conferenceSchedule.days.map((day, dayIndex) => (
            <div
              key={dayIndex}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-green-100"
            >
              {/* 日期標題 */}
              <div className="bg-green-50 p-4 border-b border-green-200">
                <h2 className="text-xl font-semibold text-center">{day.date}</h2>
              </div>

              {/* Grid Layout for Events - 4 columns: Time | Event | Event/Parallel | Poster */}
              <div className="p-4">
                <div 
                  className="grid grid-cols-4 gap-2"
                  style={{ gridAutoRows: "minmax(60px, auto)" }}
                >
                  {/* Time slots */}
                  {day.eventTimes.map((time, timeIndex) => (
                    <div
                      key={timeIndex}
                      className="flex items-center justify-center p-2 border border-gray-200 text-sm font-medium text-gray-700 bg-gray-50"
                      style={{
                        gridColumn: "1 / 2",
                        gridRow: `${timeIndex + 1} / ${timeIndex + 2}`,
                      }}
                    >
                      <Clock className="h-4 w-4 text-green-700 mr-2 flex-shrink-0" />
                      {time}
                    </div>
                  ))}

                  {/* Main Events */}
                  {day.events.map((event, eventIndex) => {
                    // Check if there are any poster events that overlap with this event's time slot
                    const hasOverlappingPosterEvents = day.posterEvent && day.posterEvent.some(poster => {
                      const eventEnd = event.start_time_index + event.num_of_time_slot;
                      const posterEnd = poster.start_time_index + poster.num_of_time_slot;
                      // Check for overlap: event starts before poster ends AND event ends after poster starts
                      return event.start_time_index < posterEnd && eventEnd > poster.start_time_index;
                    });
                    
                    // Calculate column span for main event
                    const columnStart = 2;
                    let columnEnd;
                    
                    if (event.parallel && hasOverlappingPosterEvents) {
                      columnEnd = 3; // If has parallel, only take column 2
                    } else if (event.parallel && !hasOverlappingPosterEvents) {
                      columnEnd = 4; // If no parallel but has overlapping poster events, span columns 2-3
                    } else if (hasOverlappingPosterEvents) {
                      columnEnd = 4; // If no parallel but has overlapping poster events, span columns 2-3
                    } else {
                      columnEnd = 5; // If no parallel and no overlapping poster events, span columns 2-4
                    }

                    return (
                      <React.Fragment key={eventIndex}>
                        {/* Main Event */}
                        <div
                          className="p-3 hover:bg-green-50 border border-green-200 bg-white rounded"
                          style={{
                            gridColumn: `${columnStart} / ${columnEnd}`,
                            gridRow: `${event.start_time_index + 1} / ${event.start_time_index + 1 + event.num_of_time_slot}`,
                          }}
                        >
                          <div className="h-full flex flex-col justify-center">
                            <h3 className="font-semibold text-green-800 text-sm">
                              {event.activity}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {event.location}
                            </p>
                            {event.details && (
                              <div className="mt-2 ml-2 pl-2 border-l-2 border-green-200">
                                {event.details.map((detail, i) => (
                                  <p key={i} className="text-xs text-gray-700 mb-1">
                                    {detail}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Parallel Event */}
                        {event.parallel && (
                          <div
                            className="p-3 hover:bg-blue-50 border border-blue-200 bg-blue-25 rounded"
                            style={{
                              gridColumn: `${columnEnd} / ${columnEnd+1}`,
                              gridRow: `${event.start_time_index + 1} / ${event.start_time_index + 1 + (event.parallel_num_of_time_slot || event.num_of_time_slot)}`,
                            }}
                          >
                            <div className="h-full flex flex-col justify-center">
                              <h3 className="font-semibold text-blue-800 text-sm">
                                {event.parallel}
                              </h3>
                              <p className="text-xs text-gray-600 mt-1">
                                <MapPin className="h-3 w-3 inline mr-1" />
                                {event.parallelLocation}
                              </p>
                              {event.parallelDetails && (
                                <div className="mt-2 ml-2 pl-2 border-l-2 border-green-200">
                                  {event.parallelDetails.map((pDetail, i) => (
                                    <p key={i} className="text-xs text-gray-700 mb-1">
                                      {pDetail}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}

                  {/* Poster Events */}
                  {day.posterEvent && day.posterEvent.map((posterEvent, posterIndex) => (
                    <div
                      key={`poster-${posterIndex}`}
                      className="p-3 hover:bg-purple-50 border border-purple-200 bg-purple-25 rounded"
                      style={{
                        gridColumn: "4 / 5",
                        gridRow: `${posterEvent.start_time_index + 1} / ${posterEvent.start_time_index + 1 + posterEvent.num_of_time_slot}`,
                      }}
                    >
                      <div className="h-full flex flex-col justify-center">
                        <h3 className="font-semibold text-purple-800 text-sm">
                          {posterEvent.activity}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {posterEvent.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 註解資訊 */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">注意事項</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>議程可能會有所調整，請以現場公告為準</li>
          </ul>
        </div>
      </div>
    </div>
  );
}