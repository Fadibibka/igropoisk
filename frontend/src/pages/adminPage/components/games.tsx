import arrow from '@shared/assets/svg/arrow.svg';
import user from '@shared/assets/svg/user.svg';
import like from '@shared/assets/svg/like.svg';
import comments from '@shared/assets/svg/comments.svg';
import Stars from '@shared/components/stars';

const Reviews = () => {

  return (
    <>
            <h3 className="uppercase font-display text-xl">Ваши оценки</h3>
            <section className="w-full mt-6">
              <div className="flex">
                <div className="w-full">
                  <div className="flex flex-col space-y-6">
                    {/* Пример оценки */}
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div className="bg-purple rounded-xl flex flex-col p-8 w-full h-96" key={i}>
                        <div className="flex gap-4 justify-center items-center">
                          <img alt="game" />

                          <img src={user} alt="user" />
                          <div className="flex flex-col">
                            {/* <p className="text-md">User {review.user_id.slice(0, 5)}...</p> */}
                            <p className="text-md">User...</p>
                            {/* <p className="text-gray text-sm">{new Date(review.created_at).toLocaleDateString('ru-RU')}</p> */}
                            <p className="text-gray text-sm">02.03.2304</p>
                          </div>
                          {/* <Stars size={15} rating={+review.rating} /> */}
                          <Stars size={15} rating={4.2} />
                        </div>
                        
                        <div className="flex pt-1 space-x-1 self-end">
                          {/* <p className="text-xs text-gray">{review.likes ?? 0}</p>
                          <img className="w-4 h-4" src={like} alt="like" />
                          <p className="text-xs text-gray">{review.dislikes ?? 0}</p>
                          <img className="w-4 h-4 rotate-180" src={like} alt="dislike" />
                          <p className="text-xs text-gray">{review.comments ?? 0}</p>
                          <img className="w-4 h-4" src={comments} alt="comments" /> */}
                          <p className="text-xs text-gray">{32}</p>
                          <img className="w-4 h-4" src={like} alt="like" />
                          <p className="text-xs text-gray">{11}</p>
                          <img className="w-4 h-4 rotate-180" src={like} alt="dislike" />
                          <p className="text-xs text-gray">{2}</p>
                          <img className="w-4 h-4" src={comments} alt="comments" />
                        </div>

                        <div className="w-full h-0.5 bg-gray mt-2"></div>

                        <div className="relative overflow-hidden">
                          <div className="h-full mt-4">
                            {/* <pre className="text-sm whitespace-pre-wrap font-sans">
                              {review.review_text}
                            </pre> */}
                            <pre className="text-sm whitespace-pre-wrap font-sans">
                              тиеективылми оыувапимз лцврупекамлжо рпцуквеказщлм рывуеаз лждом руфзцывщкжрм                              тиеективылми оыувапимз лцврупекамлжо рпцуквеказщлм рывуеаз лждом руфзцывщкжрм
                              тиеективылми оыувапимз лцврупекамлжо рпцуквеказщлм рывуеаз лждом руфзцывщкжрм
                              тиеективылми оыувапимз лцврупекамлжо рпцуквеказщлм рывуеаз лждом руфзцывщкжрм
                              тиеективылми оыувапимз лцврупекамлжо рпцуквеказщлм рывуеаз лждом руфзцывщкжрм
                              тиеективылми оыувапимз лцврупекамлжо рпцуквеказщлм рывуеаз лждом руфзцывщкжрм
                              тиеективылми оыувапимз лцврупекамлжо рпцуквеказщлм рывуеаз лждом руфзцывщкжрм
                              тиеективылми оыувапимз лцврупекамлжо рпцуквеказщлм рывуеаз лждом руфзцывщкжрм                              тиеективылми оыувапимз лцврупекамлжо рпцуквеказщлм рывуеаз лждом руфзцывщкжрм
                              тиеективылми оыувапимз лцврупекамлжо рпцуквеказщлм рывуеаз лждом руфзцывщкжрм
                              тиеективылми оыувапимз лцврупекамлжо рпцуквеказщлм рывуеаз лждом руфзцывщкжрм
                              тиеективылми оыувапимз лцврупекамлжо рпцуквеказщлм рывуеаз лждом руфзцывщкжрм
                              тиеективылми оыувапимз лцврупекамлжо рпцуквеказщлм рывуеаз лждом руфзцывщкжрм
                              тиеективылми оыувапимз лцврупекамлжо рпцуквеказщлм рывуеаз лждом руфзцывщкжрм                              тиеективылми оыувапимз лцврупекамлжо рпцуквеказщлм рывуеаз лждом руфзцывщкжрм
                              тиеективылми оыувапимз лцврупекамлжо рпцуквеказщлм рывуеаз лждом руфзцывщкжрм
                              тиеективылми оыувапимз лцврупекамлжо рпцуквеказщлм рывуеаз лждом руфзцывщкжрм
                              тиеективылми оыувапимз лцврупекамлжо рпцуквеказщлм рывуеаз лждом руфзцывщкжрм
                              тиеективылми оыувапимз лцврупекамлжо рпцуквеказщлм рывуеаз лждом руфзцывщкжрм
                              тиеективылми оыувапимз лцврупекамлжо рпцуквеказщлм рывуеаз лждом руфзцывщкжрм                              тиеективылми оыувапимз лцврупекамлжо рпцуквеказщлм рывуеаз лждом руфзцывщкжрм
                              тиеективылми оыувапимз лцврупекамлжо рпцуквеказщлм рывуеаз лждом руфзцывщкжрм
                              тиеективылми оыувапимз лцврупекамлжо рпцуквеказщлм рывуеаз лждом руфзцывщкжрм
                              тиеективылми оыувапимз лцврупекамлжо рпцуквеказщлм рывуеаз лждом руфзцывщкжрм
                              тиеективылми оыувапимз лцврупекамлжо рпцуквеказщлм рывуеаз лждом руфзцывщкжрм

                            </pre>
                          </div>
                          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-purple via-purple/80 to-transparent flex flex-col items-end justify-end">
                            <div className="w-full h-0.5 bg-white"></div>
                            <button className="text-white text-lg flex">
                              <p>Открыть</p>
                              <img className="mt-2.5 w-3 h-3 rotate-90 ml-2" src={arrow} alt="arrow" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
  );
};

export default Reviews;