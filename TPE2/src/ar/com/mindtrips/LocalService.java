package ar.com.mindtrips;

import org.json.JSONException;
import org.json.JSONObject;

import android.app.AlarmManager;
import android.app.IntentService;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.SystemClock;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.TaskStackBuilder;
import android.text.format.DateUtils;
import android.text.format.Time;
import ar.edu.itba.hci2012.api.RequestReceiver;
import ar.edu.itba.hci2012.api.intent.Get;
import ar.edu.itba.hci2012.api.intent.QueryIntent;

public class LocalService extends IntentService {

	private String airline;
	private String flightId;
	private String oldstatus;
	private Boolean finished = false;
	public LocalService() {
		super("LocalService");
	}

	@Override
	protected void onHandleIntent(Intent intent) {
		airline = intent.getStringExtra("airline");
		flightId = intent.getStringExtra("flightId");
		oldstatus = intent.getStringExtra("oldstatus");
		RequestReceiver reciver = new RequestReceiver() {
			public void onSuccess(JSONObject json) {
				System.out.println("ENTRO");
				compareData(json);
				finished = true;
			}
		};
		QueryIntent call = new Get(reciver, "Status", "GetFlightStatus");
		call.put("airline_id", airline);
		call.put("flight_num", flightId);
		startService(call);
		sendNotification();
		SystemClock.sleep(30000);
		scheduleNextUpdate();
	}

	private void compareData(JSONObject json) {
		try {
			String newstatus = json.getString("status").toString();
			if (oldstatus.compareTo(newstatus) != 0) {
				sendNotification();
				oldstatus = newstatus;
			}
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	private void sendNotification(){
		NotificationCompat.Builder mBuilder =
		        new NotificationCompat.Builder(this)
				.setSmallIcon(R.drawable.star)
		        .setContentTitle("My notification")
		        .setContentText(airline + " - " + flightId );
		Intent resultIntent = new Intent(this, MainActivity.class);
		resultIntent.putExtra("airline", airline);
		resultIntent.putExtra("flightId", flightId);
		TaskStackBuilder stackBuilder = TaskStackBuilder.create(this);
		stackBuilder.addParentStack(MainActivity.class);
		stackBuilder.addNextIntent(resultIntent);
		PendingIntent resultPendingIntent =
		        stackBuilder.getPendingIntent(
		            0,
		            PendingIntent.FLAG_UPDATE_CURRENT
		        );
		mBuilder.setContentIntent(resultPendingIntent);
		NotificationManager mNotificationManager =
		    (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
		mNotificationManager.notify(0, mBuilder.build());
	}
	
	private void scheduleNextUpdate() {
		Intent intent = new Intent(this, this.getClass());
		intent.putExtra("airline", airline);
		intent.putExtra("flightId", flightId);
		intent.putExtra("oldstatus", oldstatus);
		PendingIntent pendingIntent = PendingIntent.getService(this, 0, intent,
				PendingIntent.FLAG_UPDATE_CURRENT);

		long currentTimeMillis = System.currentTimeMillis();
		long nextUpdateTimeMillis = currentTimeMillis
				+ 120* DateUtils.SECOND_IN_MILLIS;
		Time nextUpdateTime = new Time();
		nextUpdateTime.set(nextUpdateTimeMillis);
		AlarmManager alarmManager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
		alarmManager.set(AlarmManager.RTC, nextUpdateTimeMillis, pendingIntent);
	}

}