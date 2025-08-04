"use client"

import React from "react";
import { Card, CardContent } from "./ui/card";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import testimonials from "../data/testimonial";

const TestimonialCarousel = () => {
	return (
		<div className="mt-24">
			<h2 className="text-3xl font-bold text-center text-orange-900 mb-12">Messages</h2>
			<Carousel
				plugins={[
					Autoplay({
						delay: 2000,
					}),
				]}
			>
				<CarouselContent>

					{testimonials.map((t, i) => (
						<CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
							<Card className="bg-white/80 background-blur-sm">
								<CardContent className="p-6">
									<blockquote className="space-y-4">
										<p className="text-orange-700 italic">
											&quot;{t.text}&quot;
										</p>
										<footer>
											<div className="font-semibold text-orange-900">
												{t.author}
											</div>
											<div className="text-sm text-orange-600">
												{t.role}
											</div>
										</footer>
									</blockquote>
								</CardContent>
							</Card>
						</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>
		</div>
	)
};

export default TestimonialCarousel;