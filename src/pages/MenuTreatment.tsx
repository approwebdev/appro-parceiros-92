                        {typeof item.button_text === 'string' ? item.button_text : 'Saiba mais...'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TRATAMENTOS RELACIONADOS */}
                  {relatedTreatments.length > 0 && (
                    <div className="mt-8">
                      <div className="flex flex-col items-center">
                        <h2 className="text-xl md:text-2xl font-bold text-black mb-4 md:mb-6 text-center">Tratamentos Relacionados</h2>
                        
                        {/* DESKTOP - Layout com alinhamento à direita do vídeo */}
                        <div className="hidden md:block relative">
                          {/* Controles de navegação */}
                          <div className="flex justify-between items-center mb-4 w-full max-w-5xl mx-auto">
                            <button
                              onClick={prevSlide}
                              disabled={slideIndex === 0}
                              className="bg-white/90 backdrop-blur rounded-full p-3 shadow-lg hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                              </svg>
                            </button>
                            <button
                              onClick={nextSlide}
                              disabled={slideIndex + 4 >= relatedTreatments.length}
                              className="bg-white/90 backdrop-blur rounded-full p-3 shadow-lg hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                              </svg>
                            </button>
                          </div>
                          
                          {/* Grid de 4 itens */}
                          <div className="grid grid-cols-4 gap-6 max-w-5xl mx-auto">
                            {relatedTreatments.slice(slideIndex, slideIndex + 4).map((relatedTreatment, index) => (
                              <button
                                key={`${relatedTreatment.id}-${index}`}
                                onClick={() => navigateToTreatment(relatedTreatment)}
                                className="group transition-all duration-300 hover:scale-105"
                              >
                                <div className="w-full aspect-square bg-gray-100 rounded-2xl mb-3 overflow-hidden">
                                  {relatedTreatment.images && relatedTreatment.images.length > 0 ? (
                                    <img
                                      src={relatedTreatment.images[0]}
                                      alt={relatedTreatment.name}
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <h3 className="text-sm font-medium text-gray-800 text-center">
                                  {relatedTreatment.name}
                                </h3>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* MOBILE - Layout centralizado com 3 itens */}
                        <div className="md:hidden">
                          {/* Controles mais próximos */}
                          <div className="flex justify-center gap-8 mb-6">
                            <button
                              onClick={prevSlide}
                              disabled={slideIndex === 0}
                              className="bg-white/90 backdrop-blur rounded-full p-3 shadow-lg hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                              </svg>
                            </button>
                            <button
                              onClick={nextSlide}
                              disabled={slideIndex + 3 >= relatedTreatments.length}
                              className="bg-white/90 backdrop-blur rounded-full p-3 shadow-lg hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                              </svg>
                            </button>
                          </div>
                          
                          {/* Grid centralizado de 3 itens */}
                          <div className="grid grid-cols-3 gap-4 justify-center max-w-sm mx-auto">
                            {relatedTreatments.slice(slideIndex, slideIndex + 3).map((relatedTreatment, index) => (
                              <button
                                key={`${relatedTreatment.id}-${index}`}
                                onClick={() => navigateToTreatment(relatedTreatment)}
                                className="group transition-all duration-300 hover:scale-105"
                              >
                                <div className="w-full aspect-square bg-gray-100 rounded-xl mb-2 overflow-hidden">
                                  {relatedTreatment.images && relatedTreatment.images.length > 0 ? (
                                    <img
                                      src={relatedTreatment.images[0]}
                                      alt={relatedTreatment.name}
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <h3 className="text-xs font-medium text-gray-800 text-center line-clamp-2">
                                  {relatedTreatment.name}
                                </h3>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Vídeo em Desktop */}
                <div className="hidden lg:flex items-start justify-center h-full relative overflow-visible pt-[2%]">
                  {/* Imagem de fundo expandida */}
                  <div 
                    className="absolute inset-0 bg-no-repeat bg-center opacity-30 z-0"
                    style={{
                      backgroundImage: `url(/lovable-uploads/1ac586b1-3175-4a7d-8e81-692161f57930.png)`,
                      backgroundSize: 'contain',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                  
                  <div className="w-[clamp(225px,35.975vw,411px)] aspect-[9/16] rounded-2xl overflow-hidden shadow-xl relative z-10 hover:shadow-2xl transition-all duration-300 bg-gray-100 scale-95">
                    {typeof item.video_url === 'string' && item.video_url ? (
                      <video className="w-full h-full object-cover" controls>
                        <source src={item.video_url} type="video/mp4" />
                        Seu navegador não suporta vídeos.
                      </video>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <p className="text-gray-500 text-center p-4">Vídeo não disponível</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-xl text-gray-500">Carregando tratamento...</p>
            </div>
          )}
        </div>
        
        {/* Controles do slider removidos */}
      </motion.div>
    </div>
  );
};

export default MenuTreatment;