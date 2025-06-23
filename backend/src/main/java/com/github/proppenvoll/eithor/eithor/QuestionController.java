package com.github.proppenvoll.eithor.eithor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;

import java.util.ArrayList;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

record Question(Integer questionId, String either, String or) {
};

record Answer(Integer questionId, String answer) {
};

record Distribution(Integer questionId, Integer either, Integer or) {
};

record Result(Question question, String answer, Distribution distribution) {
};

@RestController
@CrossOrigin(origins = "*") // TODO: remove this
public class QuestionController {
	public final ArrayList<Question> questions;
	public final ArrayList<Distribution> distributions;
	private final ConcurrentHashMap<String, Integer> ipCache = new ConcurrentHashMap<>();

	public Integer questionIndex = 0;

	public QuestionController() {
		this.questions = new ArrayList<>();
		this.distributions = new ArrayList<>();
		addQuestion(1, "Dog", "Cat");
		addQuestion(2, "Sweet", "Salty");
		addQuestion(3, "Book", "Movie");
		addQuestion(4, "Summer", "Winter");
		this.questions.add(new Question(5, "Car", "Motorcycle"));
		this.distributions.add(new Distribution(5, 0, 1000));
	}

	public void addQuestion(Integer questionId, String either, String or) {
		this.questions.add(new Question(questionId, either, or));
		this.distributions.add(getRandomDistribution(questionId));
	}

	public Distribution getRandomDistribution(Integer questionId) {
		return new Distribution(
				questionId,
				ThreadLocalRandom.current().nextInt(0, 101),
				ThreadLocalRandom.current().nextInt(0, 101));
	}

	public static String getIpAddress(HttpServletRequest request) {
		String preProxyIp = request.getHeader("x-forwarded-for");
		return preProxyIp == null ? request.getRemoteAddr() : preProxyIp;
	}

	@GetMapping("/api/question")
	public ResponseEntity<Question> getQuestion(HttpServletRequest request) {
		String ipAddress = getIpAddress(request);
		Integer cachedQuestionId = ipCache.get(ipAddress);

		if (cachedQuestionId == null) {
			Optional<Question> question = this.questions.stream()
					.filter(q -> q.questionId().equals(1))
					.findFirst();

			return ResponseEntity.ok(question.get());
		}

		Optional<Question> question = this.questions.stream()
				.filter(q -> q.questionId().equals(cachedQuestionId))
				.findFirst();

		if (question.isEmpty()) {
			return ResponseEntity.noContent().build();
		}

		return ResponseEntity.ok(question.get());
	}

	@PostMapping("/api/answer")
	public Result postAnswer(HttpServletRequest request, @RequestBody Answer answer) {
		Integer questionId = answer.questionId();

		Question foundQuestion = this.questions.stream()
				.filter(question -> question.questionId().equals(questionId))
				.findFirst()
				.get();

		Distribution foundDistribution = this.distributions.stream()
				.filter(distribution -> distribution.questionId().equals(questionId))
				.findFirst()
				.get();

		Integer distributionIndex = this.distributions.indexOf(foundDistribution);

		Integer updatedDistributionEither = foundQuestion.either().equals(answer.answer())
				? foundDistribution.either() + 1
				: foundDistribution.either();

		Integer updatedDistributionOr = foundQuestion.or().equals(answer.answer())
				? foundDistribution.or() + 1
				: foundDistribution.or();

		Distribution updatedDistribution = new Distribution(
				foundDistribution.questionId(),
				updatedDistributionEither,
				updatedDistributionOr);

		this.distributions.set(distributionIndex, updatedDistribution);

		String ipAddress = getIpAddress(request);
		ipCache.put(ipAddress, questionId + 1);

		Result result = new Result(foundQuestion, answer.answer(), updatedDistribution);
		return result;
	}

	@PostMapping("/api/start-over")
	public void postStartOver(HttpServletRequest request) {
		String ipAddress = getIpAddress(request);
		ipCache.remove(ipAddress);
	}
}
