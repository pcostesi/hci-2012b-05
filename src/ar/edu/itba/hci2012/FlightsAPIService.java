package ar.edu.itba.hci2012;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.utils.URIUtils;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;

import android.app.IntentService;
import android.content.Intent;
import android.os.Bundle;

public class FlightsAPIService extends IntentService {

	private final String PROTOCOL = "http";
	private final String BASE_URL = "/hci/service2/";
	private final String HOST = "eiffel.itba.edu.ar";
	private final int PORT = 80;

	final static int STARTED = 1;
	final static int DONE = 2;
	public final static int POST = 1;
	public final static int GET = 2;

	private String escapeQuery(Map<String, String> args) {
		StringBuilder builder = new StringBuilder();
		Iterator<Entry<String, String>> iter = args.entrySet().iterator();
		while (iter.hasNext()) {
			Entry<String, String> arg = iter.next();
			try {
				builder.append(URLEncoder.encode(arg.getKey(), "UTF-8"));
				builder.append("=");
				builder.append(URLEncoder.encode(arg.getValue(), "UTF-8"));
			} catch (UnsupportedEncodingException e) {
				e.printStackTrace();
			}
			if (iter.hasNext()) {
				builder.append('&');
			}
		}
		return builder.toString();
	}

	private String inputStreamToString(InputStream is) throws IOException {
		String line = "";
		StringBuilder total = new StringBuilder();

		// Wrap a BufferedReader around the InputStream
		BufferedReader rd = new BufferedReader(new InputStreamReader(is));

		// Read response until the end
		while ((line = rd.readLine()) != null) {
			total.append(line);
		}
		return total.toString();
	}

	private String get(String base, String query)
			throws ClientProtocolException, IOException {
		String path = BASE_URL + base + ".groovy";
		URI uri;
		try {
			uri = URIUtils.createURI(PROTOCOL, HOST, PORT, path, query, null);
			HttpGet httpGet = new HttpGet(uri);
			return call(httpGet);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
		return null;
	}

	private String call(HttpUriRequest request) throws ClientProtocolException,
			IOException {
		DefaultHttpClient httpClient = new DefaultHttpClient();

		HttpResponse httpResponse = httpClient.execute(request);
		HttpEntity httpEntity = httpResponse.getEntity();

		return inputStreamToString(httpEntity.getContent());

	}

	private String post(String base, String body)
			throws ClientProtocolException, IOException {
		String path = BASE_URL + base + ".groovy";
		URI uri;
		try {
			uri = URIUtils.createURI(PROTOCOL, HOST, PORT, path, null, null);
			HttpPost httpPost = new HttpPost(uri);
			httpPost.setEntity(new StringEntity(body));
			return call(httpPost);
		} catch (URISyntaxException e) {
		}
		return null;

	}

	public FlightsAPIService(String name) {
		super(name);
	}

	@Override
	protected void onHandleIntent(Intent arg0) {
		Bundle response = new Bundle();
		Bundle request = arg0.getExtras();
		RequestReceiver receiver = (RequestReceiver) request.get("receiver");
		receiver.send(FlightsAPIService.STARTED, null);

		String responseBody = null;
		String base = request.getString("ns");
		try {
			switch (request.getInt("verb")) {
			case GET:
				Bundle queryBundle = request.getBundle("query");
				Map<String, String> query = new HashMap<String, String>();
				for (String key : queryBundle.keySet()) {
					query.put(key, queryBundle.getString(key));

				}
				responseBody = get(base, escapeQuery(query));
				break;

			case POST:
				String body = request.getString("body");
				responseBody = post(base, body);
				break;
			}
		} catch (ClientProtocolException e) {
			response.putString("error", e.getLocalizedMessage());
		} catch (IllegalStateException e) {
			response.putString("error", e.getLocalizedMessage());
		} catch (IOException e) {
			response.putString("error", e.getLocalizedMessage());
		}
		response.putString("response", responseBody);
		
		receiver.send(FlightsAPIService.DONE, response);
		this.stopSelf();
	}

}
