export interface MonthData {
  month: number
  label: string
  season: string
  seasonIcon: string
  color: string
  bgGradient: string
  defaultText: string
  // Users will replace these with actual photo/video paths
  photo: string
  video?: string
}

export const months: MonthData[] = [
  {
    month: 2,
    label: '2がつ',
    season: 'ふゆ',
    seasonIcon: 'ac_unit',
    color: '#90CAF9',
    bgGradient: 'from-blue-50 to-sky-100',
    defaultText: '2がつの みなとくん。\n2さいに なったね。\nケーキを たべて、にこにこ！',
    photo: '/photos/02.jpg',
  },
  {
    month: 3,
    label: '3がつ',
    season: 'はる',
    seasonIcon: 'local_florist',
    color: '#F48FB1',
    bgGradient: 'from-pink-50 to-rose-100',
    defaultText: '3がつの みなとくん。\nおはなが さいたよ。\nはるが きたね！',
    photo: '/photos/03.jpg',
  },
  {
    month: 4,
    label: '4がつ',
    season: 'はる',
    seasonIcon: 'park',
    color: '#A5D6A7',
    bgGradient: 'from-green-50 to-emerald-100',
    defaultText: '4がつの みなとくん。\nさくらが きれいだね。\nおさんぽ たのしいね！',
    photo: '/photos/04.jpg',
  },
  {
    month: 5,
    label: '5がつ',
    season: 'はる',
    seasonIcon: 'flag',
    color: '#81D4FA',
    bgGradient: 'from-cyan-50 to-sky-100',
    defaultText: '5がつの みなとくん。\nこいのぼりが およいでるよ。\nおそとで たくさん あそんだね！',
    photo: '/photos/05.jpg',
  },
  {
    month: 6,
    label: '6がつ',
    season: 'つゆ',
    seasonIcon: 'water_drop',
    color: '#80CBC4',
    bgGradient: 'from-teal-50 to-cyan-100',
    defaultText: '6がつの みなとくん。\nあめが ふっても げんきいっぱい。\nかさを さしたね！',
    photo: '/photos/06.jpg',
  },
  {
    month: 7,
    label: '7がつ',
    season: 'なつ',
    seasonIcon: 'wb_sunny',
    color: '#FFE082',
    bgGradient: 'from-yellow-50 to-amber-100',
    defaultText: '7がつの みなとくん。\nなつが きたよ。\nおみずで あそんで たのしいね！',
    photo: '/photos/07.jpg',
  },
  {
    month: 8,
    label: '8がつ',
    season: 'なつ',
    seasonIcon: 'pool',
    color: '#4FC3F7',
    bgGradient: 'from-sky-50 to-blue-100',
    defaultText: '8がつの みなとくん。\nうみや プールで おおはしゃぎ。\nすいかも たべたね！',
    photo: '/photos/08.jpg',
  },
  {
    month: 9,
    label: '9がつ',
    season: 'あき',
    seasonIcon: 'emoji_nature',
    color: '#FFAB91',
    bgGradient: 'from-orange-50 to-amber-100',
    defaultText: '9がつの みなとくん。\nすずしく なってきたね。\nとんぼを おいかけたね！',
    photo: '/photos/09.jpg',
  },
  {
    month: 10,
    label: '10がつ',
    season: 'あき',
    seasonIcon: 'eco',
    color: '#FFCC80',
    bgGradient: 'from-amber-50 to-orange-100',
    defaultText: '10がつの みなとくん。\nおちばで あそんだね。\nどんぐり みつけたよ！',
    photo: '/photos/10.jpg',
  },
  {
    month: 11,
    label: '11がつ',
    season: 'あき',
    seasonIcon: 'forest',
    color: '#A1887F',
    bgGradient: 'from-orange-50 to-yellow-100',
    defaultText: '11がつの みなとくん。\nもみじが きれいだね。\nおいもも おいしいね！',
    photo: '/photos/11.jpg',
  },
  {
    month: 12,
    label: '12がつ',
    season: 'ふゆ',
    seasonIcon: 'ac_unit',
    color: '#B0BEC5',
    bgGradient: 'from-slate-50 to-blue-50',
    defaultText: '12がつの みなとくん。\nクリスマスが きたよ。\nプレゼント もらったね！',
    photo: '/photos/12.jpg',
  },
  {
    month: 1,
    label: '1がつ',
    season: 'ふゆ',
    seasonIcon: 'celebration',
    color: '#EF9A9A',
    bgGradient: 'from-red-50 to-pink-50',
    defaultText: '1がつの みなとくん。\nあけまして おめでとう。\nもうすぐ 3さいだね！',
    photo: '/photos/01.jpg',
  },
]
