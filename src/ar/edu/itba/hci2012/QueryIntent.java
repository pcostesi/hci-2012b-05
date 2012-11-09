package ar.edu.itba.hci2012;

import java.util.Map;

import android.content.Intent;
import android.os.Bundle;

public class QueryIntent extends Intent {

	public QueryIntent(RequestReceiver receiver, int verb, String ns,
			String method, Map<String, String> query, String body) {
		super();
		this.putExtra("receiver", receiver);
		this.putExtra("verb", verb);
		this.putExtra("method", method);
		this.putExtra("ns", ns);
		Bundle queryBundle = new Bundle();
		for (String s : query.keySet()) {
			queryBundle.putString(s, query.get(s));
		}
		this.putExtra("query", queryBundle);

		this.putExtra("body", body);

		this.setClassName("ar.edu.itba.hci2012", "ar.edu.itba.hci2012.FlightsAPIService");
	}
}
